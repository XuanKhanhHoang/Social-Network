import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MessageDocument, MessageType } from 'src/schemas/message.schema';
import { AppGateway } from 'src/gateway/app.gateway';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { SendMessageDto } from 'src/api/chat/dto/send-message.dto';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { UserMinimalModel } from 'src/domains/user/interfaces';

export type SendMessageInput = {
  senderId: string;
  dto: SendMessageDto;
  file?: Express.Multer.File;
};

export type SendMessageOutput = MessageDocument;

@Injectable()
export class SendMessageService extends BaseUseCaseService<
  SendMessageInput,
  SendMessageOutput
> {
  private readonly logger = new Logger(SendMessageService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
    private readonly mediaUploadService: MediaUploadService,
  ) {
    super();
  }

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const { senderId, dto, file } = input;
    const { receiverId, type, content, nonce, mediaNonce } = dto;

    if (type === MessageType.IMAGE && !file) {
      throw new BadRequestException('Image message requires a file');
    }

    let mediaUrl: string | null = null;
    if (file) {
      try {
        mediaUrl = await this.mediaUploadService.uploadRawStream(file);
      } catch (error) {
        this.logger.error('Failed to upload media', error);
        throw new BadRequestException('Media upload failed');
      }
    }

    let conversation = await this.chatRepository.findConversation([
      senderId,
      receiverId,
    ]);

    if (!conversation) {
      conversation = await this.chatRepository.createConversation([
        senderId,
        receiverId,
      ]);
    }

    const message = await this.chatRepository.createMessage({
      conversationId: conversation._id,
      sender: senderId as any,
      type,
      content,
      nonce,
      mediaUrl,
      mediaNonce: mediaNonce,
      readBy: [senderId as any],
    });

    await this.chatRepository.updateConversation(conversation._id.toString(), {
      lastMessage: message,
      lastInteractiveAt: new Date(),
    });

    await message.populate('sender', 'firstName lastName username avatar');

    this.appGateway.emitToUser(
      receiverId,
      SocketEvents.NEW_MESSAGE,
      message as Omit<MessageDocument, 'sender'> & {
        sender: UserMinimalModel<string>;
      },
    );

    return message;
  }
}

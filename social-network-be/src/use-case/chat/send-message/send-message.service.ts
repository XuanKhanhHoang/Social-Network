import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageDocument, MessageType } from 'src/schemas/message.schema';
import { AppGateway } from 'src/gateway/app.gateway';
import { MediaUploadService } from 'src/domains/media-upload/media-upload.service';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { SendMessageDto } from 'src/api/chat/dto/send-message.dto';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import {
  ConversationDocument,
  ConversationType,
} from 'src/schemas/conversation.schema';

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
    const {
      receiverId,
      conversationId,
      type,
      content,
      nonce,
      mediaNonce,
      encryptedContents,
      encryptedFileKeys,
      keyNonce,
    } = dto;

    if (type === MessageType.IMAGE && !file) {
      throw new BadRequestException('Image message requires a file');
    }

    // Upload file if exists
    let mediaUrl: string | null = null;
    if (file) {
      try {
        mediaUrl = await this.mediaUploadService.uploadRawStream(file);
      } catch (error) {
        this.logger.error('Failed to upload media', error);
        throw new BadRequestException('Media upload failed');
      }
    }

    let conversation: ConversationDocument;
    let isGroup = false;

    // Find or create conversation
    if (conversationId) {
      // Group message
      const foundConversation =
        await this.chatRepository.findById(conversationId);
      if (!foundConversation) {
        throw new NotFoundException('Conversation not found');
      }
      const isMember = foundConversation.participants.some(
        (p) => p.user.toString() === senderId,
      );
      if (!isMember) {
        throw new ForbiddenException('Not a member of this conversation');
      }
      conversation = foundConversation;
      isGroup = conversation.type === ConversationType.GROUP;
    } else if (receiverId) {
      // 1-1 message
      let foundConversation = await this.chatRepository.findConversation([
        senderId,
        receiverId,
      ]);
      if (!foundConversation) {
        foundConversation = await this.chatRepository.createConversation([
          senderId,
          receiverId,
        ]);
      }
      conversation = foundConversation;
    } else {
      throw new BadRequestException(
        'Must provide either receiverId or conversationId',
      );
    }

    // Build message data
    const messageData: any = {
      conversationId: conversation._id,
      sender: senderId,
      type,
      nonce,
      mediaNonce,
      mediaUrl,
      readBy: [senderId],
    };

    if (isGroup) {
      // Group E2EE fields
      messageData.encryptedContents = encryptedContents;
      messageData.encryptedFileKeys = encryptedFileKeys;
      messageData.keyNonce = keyNonce;
    } else {
      // 1-1 E2EE fields
      messageData.content = content;
    }

    const message = await this.chatRepository.createMessage(messageData);

    await this.chatRepository.updateConversation(conversation._id.toString(), {
      lastMessage: message,
      lastInteractiveAt: new Date(),
    });

    await message.populate('sender', 'firstName lastName username avatar');

    // Broadcast to all participants except sender
    conversation.participants.forEach((p) => {
      const participantId = p.user.toString();
      if (participantId !== senderId) {
        this.appGateway.emitToUser(participantId, SocketEvents.NEW_MESSAGE, {
          ...message.toObject(),
          conversationType: conversation.type,
          conversationName: conversation.name,
          conversationAvatar: conversation.avatar,
          conversationCreatedBy: conversation.createdBy?.toString(),
          conversationOwner: conversation.owner?.toString(),
        });
      }
    });

    return message;
  }
}

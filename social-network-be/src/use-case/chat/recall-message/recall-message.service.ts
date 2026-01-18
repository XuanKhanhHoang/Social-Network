import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type RecallMessageInput = {
  userId: string;
  messageId: string;
};

export type RecallMessageOutput = void;

@Injectable()
export class RecallMessageService extends BaseUseCaseService<
  RecallMessageInput,
  RecallMessageOutput
> {
  private readonly logger = new Logger(RecallMessageService.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: RecallMessageInput): Promise<RecallMessageOutput> {
    const { userId, messageId } = input;

    const message = await this.chatRepository.findMessageById(messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new ForbiddenException('You can only recall your own messages');
    }

    message.isRecovered = true;
    message.content = 'recalled';
    message.nonce = 'recalled';
    // Clear group E2EE fields
    message.encryptedContents = null;
    message.encryptedFileKeys = null;
    message.keyNonce = null;

    await message.save();

    this.appGateway.server
      .to(message.conversationId.toString())
      .emit(SocketEvents.MESSAGE_RECALLED, {
        messageId: message._id,
        conversationId: message.conversationId,
      });
  }
}

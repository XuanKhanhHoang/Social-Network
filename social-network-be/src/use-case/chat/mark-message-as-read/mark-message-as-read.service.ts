import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export type MarkMessageAsReadInput = {
  conversationId: string;
  userId: string;
};

export type MarkMessageAsReadOutput = void;

@Injectable()
export class MarkMessageAsReadService extends BaseUseCaseService<
  MarkMessageAsReadInput,
  MarkMessageAsReadOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(
    input: MarkMessageAsReadInput,
  ): Promise<MarkMessageAsReadOutput> {
    const { conversationId, userId } = input;

    await this.chatRepository.markMessagesAsRead(conversationId, userId);

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) return;

    conversation.participants.forEach((p) => {
      const participantId = p.user.toString();
      if (participantId !== userId) {
        this.appGateway.emitToUser(participantId, SocketEvents.MESSAGE_READ, {
          conversationId,
          readerId: userId,
        });
      }
    });
  }
}

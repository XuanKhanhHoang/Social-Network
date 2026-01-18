import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { ConversationType } from 'src/schemas/conversation.schema';

export type DeleteGroupInput = {
  userId: string;
  conversationId: string;
};

export type DeleteGroupOutput = void;

@Injectable()
export class DeleteGroupService extends BaseUseCaseService<
  DeleteGroupInput,
  DeleteGroupOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: DeleteGroupInput): Promise<DeleteGroupOutput> {
    const { userId, conversationId } = input;

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('Not a group conversation');
    }

    const ownerId = conversation.owner
      ? conversation.owner.toString()
      : conversation.createdBy.toString();

    if (ownerId !== userId) {
      throw new ForbiddenException('Only group admin can delete the group');
    }

    await this.chatRepository.deleteConversation(conversationId);

    conversation.participants.forEach((p) => {
      this.appGateway.emitToUser(
        p.user.toString(),
        SocketEvents.GROUP_DELETED,
        {
          conversationId,
        },
      );
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { ConversationType } from 'src/schemas/conversation.schema';

export type LeaveGroupInput = {
  userId: string;
  conversationId: string;
};

export type LeaveGroupOutput = void;

@Injectable()
export class LeaveGroupService extends BaseUseCaseService<
  LeaveGroupInput,
  LeaveGroupOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: LeaveGroupInput): Promise<LeaveGroupOutput> {
    const { userId, conversationId } = input;

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Can only leave group conversations');
    }

    const isMember = conversation.participants.some(
      (p) => p.user.toString() === userId,
    );
    if (!isMember) {
      throw new BadRequestException('You are not a member of this group');
    }

    const ownerId = conversation.owner
      ? conversation.owner.toString()
      : conversation.createdBy.toString();

    if (ownerId === userId) {
      throw new ForbiddenException(
        'Group admin cannot leave the group. Please transfer ownership first or delete the group.',
      );
    }

    await this.chatRepository.removeGroupMember(conversationId, userId);

    conversation.participants.forEach((p) => {
      const participantId = p.user.toString();
      if (participantId !== userId) {
        this.appGateway.emitToUser(
          participantId,
          SocketEvents.GROUP_MEMBER_REMOVED,
          {
            conversationId,
            removedMemberId: userId,
            isLeft: true,
          },
        );
      }
    });
  }
}

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
import {
  ConversationDocument,
  ConversationType,
} from 'src/schemas/conversation.schema';

export type KickGroupMemberInput = {
  userId: string;
  conversationId: string;
  memberId: string;
};

export type KickGroupMemberOutput = ConversationDocument;

@Injectable()
export class KickGroupMemberService extends BaseUseCaseService<
  KickGroupMemberInput,
  KickGroupMemberOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: KickGroupMemberInput): Promise<KickGroupMemberOutput> {
    const { userId, conversationId, memberId } = input;

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException(
        'Can only kick members from group conversations',
      );
    }

    const ownerId = conversation.owner
      ? conversation.owner.toString()
      : conversation.createdBy.toString();

    if (ownerId !== userId) {
      throw new ForbiddenException('Only group admin can kick members');
    }

    if (memberId === userId) {
      throw new BadRequestException('Cannot kick yourself. Use leave instead.');
    }

    if (memberId === ownerId) {
      throw new BadRequestException('Cannot kick the group admin');
    }

    const isMember = conversation.participants.some(
      (p) => p.user.toString() === memberId,
    );
    if (!isMember) {
      throw new BadRequestException('User is not a member of this group');
    }

    const updated = await this.chatRepository.removeGroupMember(
      conversationId,
      memberId,
    );

    // Notify kicked member
    this.appGateway.emitToUser(memberId, SocketEvents.GROUP_MEMBER_REMOVED, {
      conversationId,
      removedMemberId: memberId,
      isKicked: true,
    });

    // Notify remaining members
    conversation.participants.forEach((p) => {
      const participantId = p.user.toString();
      if (participantId !== memberId) {
        this.appGateway.emitToUser(
          participantId,
          SocketEvents.GROUP_MEMBER_REMOVED,
          {
            conversationId,
            removedMemberId: memberId,
          },
        );
      }
    });

    return updated;
  }
}

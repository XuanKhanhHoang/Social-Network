import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { ConversationType } from 'src/schemas/conversation.schema';

export type GetGroupMembersInput = {
  userId: string;
  conversationId: string;
};

export type GroupMemberInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: { url: string };
  publicKey: string;
  joinedAt: Date;
};

export type GetGroupMembersOutput = {
  members: GroupMemberInfo[];
  createdBy: string;
  owner: string;
};

@Injectable()
export class GetGroupMembersService extends BaseUseCaseService<
  GetGroupMembersInput,
  GetGroupMembersOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(input: GetGroupMembersInput): Promise<GetGroupMembersOutput> {
    const { userId, conversationId } = input;

    const conversation =
      await this.chatRepository.getGroupWithMembers(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Not a group conversation');
    }

    const isMember = conversation.participants.some(
      (p: any) => p.user?._id?.toString() === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const members = conversation.participants.map((p: any) => ({
      _id: p.user._id.toString(),
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      username: p.user.username,
      avatar: p.user.avatar,
      publicKey: p.user.publicKey,
      joinedAt: p.joinedAt,
    }));

    return {
      members,
      createdBy: conversation.createdBy?.toString(),
      owner: conversation.owner?.toString(),
    };
  }
}

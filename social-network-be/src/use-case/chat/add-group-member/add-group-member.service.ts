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
import { ConversationDocument, ConversationType } from 'src/schemas/conversation.schema';
import { AddGroupMemberDto } from 'src/api/chat/dto/add-group-member.dto';
import { UserRepository } from 'src/domains/user/user.repository';

export type AddGroupMemberInput = {
  userId: string;
  conversationId: string;
  dto: AddGroupMemberDto;
};

export type AddGroupMemberOutput = ConversationDocument;

@Injectable()
export class AddGroupMemberService extends BaseUseCaseService<
  AddGroupMemberInput,
  AddGroupMemberOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: AddGroupMemberInput): Promise<AddGroupMemberOutput> {
    const { userId, conversationId, dto } = input;
    const { memberIds } = dto;

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Can only add members to group conversations');
    }

    if (conversation.createdBy.toString() !== userId) {
      throw new ForbiddenException('Only group creator can add members');
    }

    // Check limit
    const currentCount = conversation.participants.length;
    if (currentCount + memberIds.length > 20) {
      throw new BadRequestException('Group cannot have more than 20 members');
    }

    // Filter out existing members
    const existingMemberIds = new Set(
      conversation.participants.map((p) => p.user.toString()),
    );
    const newMemberIds = memberIds.filter((id) => !existingMemberIds.has(id));

    if (newMemberIds.length === 0) {
      throw new BadRequestException('All members are already in the group');
    }

    // Validate new members exist
    const existingUsers = await this.userRepository.findManyByIds(newMemberIds);
    if (existingUsers.length !== newMemberIds.length) {
      throw new BadRequestException('Some members do not exist');
    }

    const updated = await this.chatRepository.addGroupMembers(
      conversationId,
      newMemberIds,
    );

    // Notify existing members about new members
    conversation.participants.forEach((p) => {
      this.appGateway.emitToUser(
        p.user.toString(),
        SocketEvents.GROUP_MEMBER_ADDED,
        {
          conversationId,
          newMemberIds,
        },
      );
    });

    // Notify new members
    newMemberIds.forEach((memberId) => {
      this.appGateway.emitToUser(memberId, SocketEvents.GROUP_MEMBER_ADDED, {
        conversationId,
        groupName: conversation.name,
      });
    });

    return updated;
  }
}

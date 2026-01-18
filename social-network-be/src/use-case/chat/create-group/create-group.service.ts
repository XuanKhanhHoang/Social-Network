import {
    Injectable,
    BadRequestException
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { ConversationDocument } from 'src/schemas/conversation.schema';
import { CreateGroupDto } from 'src/api/chat/dto/create-group.dto';
import { UserRepository } from 'src/domains/user/user.repository';

export type CreateGroupInput = {
  creatorId: string;
  dto: CreateGroupDto;
};

export type CreateGroupOutput = ConversationDocument;

@Injectable()
export class CreateGroupService extends BaseUseCaseService<
  CreateGroupInput,
  CreateGroupOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: CreateGroupInput): Promise<CreateGroupOutput> {
    const { creatorId, dto } = input;
    const { name, memberIds, avatar } = dto;

    // Validate: at least 1 other member, max 19 (total 20 with creator)
    if (memberIds.length < 1 || memberIds.length > 19) {
      throw new BadRequestException('Group must have 2-20 members');
    }

    // Remove duplicates and ensure creator is included
    const uniqueMemberIds = [...new Set([creatorId, ...memberIds])];

    if (uniqueMemberIds.length > 20) {
      throw new BadRequestException('Group cannot have more than 20 members');
    }

    // Validate all members exist
    const existingUsers =
      await this.userRepository.findManyByIds(uniqueMemberIds);
    if (existingUsers.length !== uniqueMemberIds.length) {
      throw new BadRequestException('Some members do not exist');
    }

    const conversation = await this.chatRepository.createGroupConversation({
      name,
      avatar,
      createdBy: creatorId,
      participantIds: uniqueMemberIds,
    });

    // Notify all members except creator
    uniqueMemberIds.forEach((memberId) => {
      if (memberId !== creatorId) {
        this.appGateway.emitToUser(memberId, SocketEvents.GROUP_MEMBER_ADDED, {
          conversationId: conversation._id,
          groupName: name,
        });
      }
    });

    return conversation;
  }
}

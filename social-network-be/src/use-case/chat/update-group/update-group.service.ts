import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { AppGateway } from 'src/gateway/app.gateway';
import { SocketEvents } from 'src/share/constants/socket.constant';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import {
  ConversationDocument,
  ConversationType,
} from 'src/schemas/conversation.schema';
import { UpdateGroupDto } from 'src/api/chat/dto/update-group.dto';

export type UpdateGroupInput = {
  userId: string;
  conversationId: string;
  dto: UpdateGroupDto;
};

export type UpdateGroupOutput = ConversationDocument;

@Injectable()
export class UpdateGroupService extends BaseUseCaseService<
  UpdateGroupInput,
  UpdateGroupOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: UpdateGroupInput): Promise<UpdateGroupOutput> {
    const { userId, conversationId, dto } = input;

    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new ForbiddenException('Can only update group conversations');
    }

    const ownerId = conversation.owner
      ? conversation.owner.toString()
      : conversation.createdBy.toString();

    if (ownerId !== userId) {
      throw new ForbiddenException('Only group admin can update group info');
    }

    const updated = await this.chatRepository.updateGroupInfo(conversationId, {
      name: dto.name,
      avatar: dto.avatar,
    });

    // Notify all members
    conversation.participants.forEach((p) => {
      this.appGateway.emitToUser(
        p.user.toString(),
        SocketEvents.GROUP_UPDATED,
        {
          conversationId,
          name: dto.name,
          avatar: dto.avatar,
        },
      );
    });

    return updated;
  }
}

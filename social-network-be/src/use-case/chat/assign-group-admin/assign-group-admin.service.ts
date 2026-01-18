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
import {
  ConversationDocument,
  ConversationType,
} from 'src/schemas/conversation.schema';
import { AssignGroupAdminDto } from 'src/api/chat/dto/assign-group-admin.dto';

export type AssignGroupAdminInput = {
  userId: string;
  conversationId: string;
  dto: AssignGroupAdminDto;
};

export type AssignGroupAdminOutput = ConversationDocument;

@Injectable()
export class AssignGroupAdminService extends BaseUseCaseService<
  AssignGroupAdminInput,
  AssignGroupAdminOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  async execute(input: AssignGroupAdminInput): Promise<AssignGroupAdminOutput> {
    const { userId, conversationId, dto } = input;

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
      throw new ForbiddenException(
        'Only current group admin can assign new admin',
      );
    }

    const isMembers = conversation.participants.some(
      (p) => p.user.toString() === dto.newAdminId,
    );
    if (!isMembers) {
      throw new BadRequestException('New admin must be a member of the group');
    }

    const updated = await this.chatRepository.updateGroupOwner(
      conversationId,
      dto.newAdminId,
    );

    conversation.participants.forEach((p) => {
      this.appGateway.emitToUser(
        p.user.toString(),
        SocketEvents.GROUP_OWNER_UPDATED,
        {
          conversationId,
          newOwnerId: dto.newAdminId,
          oldOwnerId: userId,
        },
      );
    });

    return updated;
  }
}

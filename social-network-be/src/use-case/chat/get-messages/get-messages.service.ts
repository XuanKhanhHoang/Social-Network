import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MessageDocument } from 'src/schemas/message.schema';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';

export type GetMessagesInput = {
  currentUserId: string;
  conversationId: string;
  cursor?: string;
  limit?: number;
};
export interface GetMessagesOutput extends BeCursorPaginated<MessageDocument> {}

@Injectable()
export class GetMessagesService extends BaseUseCaseService<
  GetMessagesInput,
  GetMessagesOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(input: GetMessagesInput): Promise<GetMessagesOutput> {
    const { conversationId, currentUserId, cursor, limit = 20 } = input;
    const conversation = await this.chatRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    const isMember = conversation.participants.some(
      (p) => p.user.toString() === currentUserId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this conversation');
    }
    // Repository filters by joinedAt internally
    return this.chatRepository.getMessages(
      conversationId,
      currentUserId,
      cursor,
      limit,
    );
  }
}

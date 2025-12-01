import { Injectable } from '@nestjs/common';
import { ConversationDocument } from 'src/schemas/conversation.schema';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';

export type GetConversationsInput = {
  userId: string;
  cursor?: string;
  limit?: number;
};
export interface GetConversationsOutput
  extends BeCursorPaginated<ConversationDocument> {}

@Injectable()
export class GetConversationsService extends BaseUseCaseService<
  GetConversationsInput,
  GetConversationsOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(input: GetConversationsInput): Promise<GetConversationsOutput> {
    const { userId, cursor, limit = 20 } = input;
    return this.chatRepository.getConversations(userId, cursor, limit);
  }
}

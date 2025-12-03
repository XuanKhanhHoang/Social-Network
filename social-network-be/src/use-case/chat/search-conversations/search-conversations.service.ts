import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { SearchConversationsWithPaginationResults } from 'src/domains/chat/interfaces/search-conversations-result.interface';

export type SearchConversationsInput = {
  userId: string;
  search?: string;
  cursor?: string;
  limit?: number;
};

export interface SearchConversationsOutput
  extends BeCursorPaginated<SearchConversationsWithPaginationResults> {}

@Injectable()
export class SearchConversationsService extends BaseUseCaseService<
  SearchConversationsInput,
  SearchConversationsOutput
> {
  constructor(private readonly chatRepository: ChatRepository) {
    super();
  }

  async execute(
    input: SearchConversationsInput,
  ): Promise<SearchConversationsOutput> {
    const { userId, search, cursor, limit = 20 } = input;
    return this.chatRepository.searchConversationsWithPagination(
      userId,
      search,
      cursor,
      limit,
    );
  }
}

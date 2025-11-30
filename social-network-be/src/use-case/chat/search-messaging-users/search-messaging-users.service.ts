import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { CursorPaginationWithSearchQueryDto } from 'src/share/dto/req/cursor-pagination-with-search-query.dto';
import { RankedUser, RankingHelper } from '../shared/ranking.helper';

export interface SearchMessagingUsersServiceOutput
  extends BeCursorPaginated<RankedUser> {}

export interface SearchMessagingUsersServiceInput
  extends CursorPaginationWithSearchQueryDto {
  currentUserId: string;
}

@Injectable()
export class SearchMessagingUsersService extends BaseUseCaseService<
  SearchMessagingUsersServiceInput,
  SearchMessagingUsersServiceOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {
    super();
  }

  async execute(
    input: SearchMessagingUsersServiceInput,
  ): Promise<SearchMessagingUsersServiceOutput> {
    const { currentUserId, search, limit = 12, cursor } = input;
    const keyword = search?.trim();

    const [conversations, friends] = await Promise.all([
      this.chatRepository.searchConversations(currentUserId, keyword),
      this.friendshipRepository.searchFriends(currentUserId, keyword),
    ]);

    const usersMap = RankingHelper.prepareUsersMap(
      currentUserId,
      friends,
      conversations,
    );

    const allRankedUsers = RankingHelper.rankUsers(usersMap);

    let paginatedResult = allRankedUsers;

    if (cursor) {
      const cursorScore = parseFloat(cursor);
      if (!isNaN(cursorScore)) {
        paginatedResult = allRankedUsers.filter(
          (item) => item.score < cursorScore,
        );
      }
    }

    const hasNextPage = paginatedResult.length > limit;
    const data = paginatedResult.slice(0, limit);

    const nextCursor =
      hasNextPage && data.length > 0
        ? data[data.length - 1].score.toString()
        : undefined;

    return {
      data,
      pagination: { hasMore: hasNextPage, nextCursor },
    };
  }
}

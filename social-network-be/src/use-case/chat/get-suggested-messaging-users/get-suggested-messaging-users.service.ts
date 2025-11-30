import { Injectable } from '@nestjs/common';
import { ChatRepository } from 'src/domains/chat/chat.repository';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { CursorPaginationQueryDto } from 'src/share/dto/req/cursor-pagination-query.dto';
import { RankedUser, RankingHelper } from '../shared/ranking.helper';

export interface GetSuggestedMessagingUsersServiceOutput
  extends BeCursorPaginated<RankedUser> {}

export interface GetSuggestedMessagingUsersServiceInput
  extends CursorPaginationQueryDto {
  currentUserId: string;
}

@Injectable()
export class GetSuggestedMessagingUsersService extends BaseUseCaseService<
  GetSuggestedMessagingUsersServiceInput,
  GetSuggestedMessagingUsersServiceOutput
> {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {
    super();
  }

  async execute(
    input: GetSuggestedMessagingUsersServiceInput,
  ): Promise<GetSuggestedMessagingUsersServiceOutput> {
    const { currentUserId, limit = 12, cursor } = input;

    const [conversations, friends] = await Promise.all([
      this.chatRepository.findRecentConversations(currentUserId),
      this.friendshipRepository.findFriends(currentUserId),
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

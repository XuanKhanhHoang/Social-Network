import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import {
  SuggestedFriendCursorData,
  UserMinimalModel,
} from 'src/domains/user/interfaces';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import {
  decodeCursor,
  encodeCursor,
} from 'src/share/utils/cursor-encode-handling';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetFriendSuggestionsInput {
  userId: string;
  limit?: number;
  cursor?: string;
}

export interface GetSuggestFriendOutput
  extends BeCursorPaginated<UserMinimalModel<Types.ObjectId>> {}

@Injectable()
export class GetSuggestFriendsService extends BaseUseCaseService<
  GetFriendSuggestionsInput,
  GetSuggestFriendOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {
    super();
  }

  async execute(
    input: GetFriendSuggestionsInput,
  ): Promise<GetSuggestFriendOutput> {
    const { userId, limit = 20, cursor } = input;

    const decodedCursor = cursor
      ? decodeCursor<SuggestedFriendCursorData>(cursor)
      : undefined;

    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const { friendIds } = await this.friendshipRepository.findFriendIdsList({
      userId,
      limit: 2000,
    });
    const excludeIds =
      await this.friendshipRepository.getUnableFriendCandidates(userId);
    const mutualFriendIds =
      await this.friendshipRepository.getMutualFriendsCandidates(
        userId,
        friendIds,
        100,
      );

    const suggestions = await this.userRepository.findFriendSuggestions({
      excludeIds: excludeIds,
      provinceCode: currentUser.provinceCode,
      detectedCity: currentUser.detectedCity,
      limit: limit + 1,
      cursor: decodedCursor,
      mutualFriendIds,
    });

    const hasMore = suggestions.length > limit;

    let nextCursor: string | null = null;
    if (hasMore) {
      const lastItem = suggestions[limit - 1];
      nextCursor = encodeCursor({
        lastScore: lastItem.suggestionScore,
        lastId: lastItem._id.toString(),
      });
    }

    const data = suggestions.slice(0, limit).map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
    }));

    return {
      data,
      pagination: {
        hasMore,
        nextCursor,
      },
    };
  }
}

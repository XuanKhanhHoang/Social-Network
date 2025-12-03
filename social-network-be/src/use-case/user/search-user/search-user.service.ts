import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/domains/user/user.repository';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';

export interface SearchUserInput {
  userId: string;
  query: string;
  limit: number;
  cursor?: string;
}
export type SearchUserOutput = BeCursorPaginated<{
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  friendshipStatus: FriendshipStatus | null;
  isRequester: boolean;
}>;
@Injectable()
export class SearchUserService extends BaseUseCaseService<
  SearchUserInput,
  SearchUserOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
  ) {
    super();
  }

  async execute(input: SearchUserInput): Promise<SearchUserOutput> {
    const { userId, query, limit, cursor } = input;

    const excludeIds =
      await this.friendshipRepository.findAllBlockedUserIds(userId);

    excludeIds.push(userId);

    const users = await this.userRepository.searchUsers(
      query,
      limit,
      cursor,
      excludeIds,
    );

    if (users.length === 0) {
      return { data: [], pagination: { nextCursor: null, hasMore: false } };
    }

    const result = await Promise.all(
      users.map(async (user) => {
        const userStrId = user._id.toString();
        const friendship = await this.friendshipRepository.findRelationship(
          userId,
          userStrId,
        );

        let status: FriendshipStatus | null = null;
        let isRequester = false;

        if (friendship) {
          status = friendship.status;
          isRequester = friendship.requester.toString() === userId;
        }

        return {
          _id: userStrId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.avatar?.url || '',
          friendshipStatus: status,
          isRequester,
        };
      }),
    );

    const nextCursor =
      users.length > 0 ? users[users.length - 1]._id.toString() : null;

    return {
      data: result,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null,
      },
    };
  }
}

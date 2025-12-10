import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserMinimalModel } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserFriendsPreviewInput {
  username: string;
  requestingUserId?: string;
  limit?: number;
  cursor?: number | string;
  search?: string;
}
export interface GetUserFriendsPreviewOutput
  extends BeCursorPaginated<UserMinimalModel<Types.ObjectId>> {
  total: number;
}

@Injectable()
export class GetUserFriendsPreviewService extends BaseUseCaseService<
  GetUserFriendsPreviewInput,
  GetUserFriendsPreviewOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userDomainsService: UserDomainsService,
  ) {
    super();
  }

  async execute(
    input: GetUserFriendsPreviewInput,
  ): Promise<GetUserFriendsPreviewOutput> {
    const { username, requestingUserId, limit = 9, cursor, search } = input;

    const profileUser =
      await this.userRepository.findUserFriendsContextByUsername(username);

    if (!profileUser) {
      throw new NotFoundException('User not found');
    }

    const profileUserIdStr = profileUser._id.toString();
    const isOwner = requestingUserId && profileUserIdStr === requestingUserId;

    const isFriend =
      !isOwner &&
      requestingUserId &&
      (await this.friendshipRepository.areFriends(
        requestingUserId,
        profileUserIdStr,
      ));

    if (
      !this.userDomainsService.canView(
        profileUser.privacySettings.friendList,
        isOwner,
        !!isFriend,
      )
    ) {
      throw new ForbiddenException("You cannot view this user's friend list");
    }

    let friendsData: UserMinimalModel<Types.ObjectId>[] = [];
    let nextCursor: number | string | null = null;

    if (search) {
      const allFriendIds =
        await this.friendshipRepository.findAllFriendIds(profileUserIdStr);
      const searchResult = await this.userRepository.findManyByIdsAndSearch(
        allFriendIds,
        search,
        limit,
        cursor as string,
      );
      friendsData = searchResult;
      nextCursor =
        searchResult.length === limit
          ? searchResult[searchResult.length - 1]._id.toString()
          : null;
    } else {
      const result = await this.friendshipRepository.findFriendIdsList({
        userId: profileUserIdStr,
        limit,
        cursor: cursor as number,
      });

      const { friendIds } = result;
      nextCursor = result.nextCursor;

      if (friendIds.length > 0) {
        const friends = await this.userRepository.findManyByIds(friendIds);
        const friendMap = new Map(friends.map((f) => [f._id.toString(), f]));
        friendsData = friendIds
          .map((id) => friendMap.get(id))
          .filter(
            (f) => f != null && !(f as any).deletedAt,
          ) as UserMinimalModel<Types.ObjectId>[];
      }
    }

    return {
      total: profileUser.friendCount,
      data: friendsData,
      pagination: {
        hasMore: nextCursor !== null,
        nextCursor: nextCursor !== null ? String(nextCursor) : null,
      },
    };
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PopulatedFriend } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { BeCursorPaginated } from 'src/share/dto/res/be-paginated.dto';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserFriendsPreviewInput {
  username: string;
  requestingUserId?: string;
  limit?: number;
  cursor?: number;
}
export interface GetUserFriendsPreviewOutput
  extends BeCursorPaginated<PopulatedFriend> {
  total: number;
}

@Injectable()
export class GetUserFriendsPreviewService extends BaseUseCaseService<
  GetUserFriendsPreviewInput,
  GetUserFriendsPreviewOutput
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainsService: UserDomainsService,
  ) {
    super();
  }
  async execute(
    input: GetUserFriendsPreviewInput,
  ): Promise<GetUserFriendsPreviewOutput> {
    const { username, requestingUserId, limit = 9, cursor } = input;
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
      (await this.userRepository.areFriends(
        requestingUserId,
        profileUserIdStr,
      ));

    if (
      !this.userDomainsService.canView(
        profileUser.privacySettings.friendList,
        isOwner,
        isFriend,
      )
    ) {
      throw new ForbiddenException("You cannot view this user's friend list");
    }

    const userWithFriends = await this.userRepository.findFriendsList({
      userId: profileUserIdStr,
      limit,
      cursor,
    });

    return {
      total: profileUser.friendCount,
      data: userWithFriends.data,
      pagination: {
        hasMore: userWithFriends.nextCursor !== null,
        nextCursor: userWithFriends.nextCursor + '',
      },
    };
  }
}

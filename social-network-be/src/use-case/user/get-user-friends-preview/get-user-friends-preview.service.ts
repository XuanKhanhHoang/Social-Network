import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PopulatedFriend } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserFriendsPreviewInput {
  username: string;
  requestingUserId?: string;
  limit?: number;
  page?: number;
}
export interface GetUserFriendsPreviewOutput {
  total: number;
  data: PopulatedFriend[];
  pagination: {
    hasNextPage: boolean;
  };
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
    const { username, requestingUserId, limit, page } = input;
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

    const userWithFriends = await this.userRepository.findFriendsListById(
      profileUser._id,
      limit,
      page,
    );

    return {
      total: profileUser.friendCount,
      data: userWithFriends.friends,
      pagination: {
        hasNextPage: userWithFriends.hasNextPage,
      },
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FriendsPreviewResponseDto } from '../dto/res/temp';
import { UserRepository } from './user-repository.service';
import { UserPrivacyService } from './user-privacy.service';

@Injectable()
export class FriendshipService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPrivacyService: UserPrivacyService,
  ) {}

  async areFriends(
    requestingUserId: string,
    profileUserId: string,
  ): Promise<boolean> {
    if (requestingUserId === profileUserId) {
      return false;
    }

    const requestingUser = await this.userRepository.findUserWithFriend(
      requestingUserId,
      profileUserId,
    );

    return !!requestingUser;
  }

  async getFriendsPreview(
    username: string,
    requestingUserId: string | null,
    limit: number = 9,
  ): Promise<FriendsPreviewResponseDto> {
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
      (await this.areFriends(requestingUserId, profileUserIdStr));

    if (
      !this.userPrivacyService.canView(
        profileUser.privacySettings.friendList,
        isOwner,
        isFriend,
      )
    ) {
      throw new ForbiddenException("You cannot view this user's friend list");
    }

    const userWithFriends =
      await this.userRepository.findByIdWithPopulatedFriends(
        profileUser._id,
        limit,
      );

    const friends = userWithFriends ? userWithFriends.friends : [];

    return {
      total: profileUser.friendCount,
      friends: friends,
    };
  }
}

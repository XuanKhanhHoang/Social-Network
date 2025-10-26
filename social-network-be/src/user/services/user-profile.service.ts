import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPrivacy } from 'src/share/enums';
import { FriendshipService } from './friend-ship.service';
import { UserBioResponseDto, UserHeaderResponseDto } from '../dto/res/temp';
import { GetProfileResponseDto } from '../dto/res/get-profile-by-user-name.dto';
import { UserRepository } from './user-repository.service';
import { PostService } from 'src/post/services/post.service';
import { RelationshipType } from '../interfaces/relationship.type';
import { UserPrivacyService } from './user-privacy.service';
import { ProfileAndRelationship } from '../interfaces';
import { PaginatedPhotos } from 'src/post/post.type';

@Injectable()
export class UserProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly friendshipService: FriendshipService,
    private readonly postService: PostService,
    private readonly userPrivacyService: UserPrivacyService,
  ) {}

  private async getProfileAndRelationship(
    username: string,
    requestingUserId: string | null,
  ): Promise<ProfileAndRelationship> {
    const profileUser =
      await this.userRepository.findProfileByUsername(username);

    if (!profileUser) {
      throw new NotFoundException('User not found');
    }

    const profileUserIdStr = profileUser._id.toString();
    const isOwner = requestingUserId && profileUserIdStr === requestingUserId;

    const isFriend =
      !isOwner &&
      requestingUserId &&
      (await this.friendshipService.areFriends(
        requestingUserId,
        profileUserIdStr,
      ));

    const relationship: RelationshipType = isOwner
      ? 'OWNER'
      : isFriend
        ? 'FRIEND'
        : 'PUBLIC';

    return { profileUser, isOwner, isFriend, relationship };
  }

  async getUserHeader(
    username: string,
    requestingUserId: string | null,
  ): Promise<UserHeaderResponseDto> {
    const { profileUser, relationship } = await this.getProfileAndRelationship(
      username,
      requestingUserId,
    );

    return {
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      username: profileUser.username,
      avatar: profileUser.avatar,
      coverPhoto: profileUser.coverPhoto,
      relationship: relationship,
    };
  }

  async getUserBio(
    username: string,
    requestingUserId: string | null,
  ): Promise<UserBioResponseDto> {
    const { profileUser, isOwner, isFriend } =
      await this.getProfileAndRelationship(username, requestingUserId);

    const settings = profileUser.privacySettings;
    const response: UserBioResponseDto = {
      bio: profileUser.bio,
    };

    if (this.userPrivacyService.canView(settings.work, isOwner, isFriend)) {
      response.work = profileUser.work;
    }
    if (
      this.userPrivacyService.canView(
        settings.currentLocation,
        isOwner,
        isFriend,
      )
    ) {
      response.currentLocation = profileUser.currentLocation;
    }

    return response;
  }

  async getProfileByUsername(
    username: string,
    requestingUserId: string | null,
  ): Promise<GetProfileResponseDto> {
    const { profileUser, isOwner, isFriend } =
      await this.getProfileAndRelationship(username, requestingUserId);

    const settings = profileUser.privacySettings;

    const profileResponse: GetProfileResponseDto = {
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      username: profileUser.username,
      avatar: profileUser.avatar,
      coverPhoto: profileUser.coverPhoto,
      createdAt: profileUser.createdAt,
      bio: profileUser.bio,
      work: undefined,
      currentLocation: undefined,
      friendCount: undefined,
    };

    if (this.userPrivacyService.canView(settings.work, isOwner, isFriend)) {
      profileResponse.work = profileUser.work;
    }
    if (
      this.userPrivacyService.canView(
        settings.currentLocation,
        isOwner,
        isFriend,
      )
    ) {
      profileResponse.currentLocation = profileUser.currentLocation;
    }
    if (
      this.userPrivacyService.canView(settings.friendList, isOwner, isFriend)
    ) {
      profileResponse.friendCount = profileUser.friendCount;
    }

    return profileResponse;
  }
  async getPhotosPreview(
    username: string,
    requestingUserId: string | null,
    limit: number = 9,
  ): Promise<PaginatedPhotos> {
    const { profileUser, isOwner, isFriend } =
      await this.getProfileAndRelationship(username, requestingUserId);

    const visiblePrivacyLevels = [UserPrivacy.PUBLIC];
    if (isOwner) {
      visiblePrivacyLevels.push(UserPrivacy.FRIENDS, UserPrivacy.PRIVATE);
    } else if (isFriend) {
      visiblePrivacyLevels.push(UserPrivacy.FRIENDS);
    }

    return this.postService.getPhotosForUser(
      profileUser._id.toString(),
      visiblePrivacyLevels,
      limit,
    );
  }
}

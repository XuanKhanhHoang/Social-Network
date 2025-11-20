import { Injectable } from '@nestjs/common';
import { UserProfileWithRelationshipExceptFriendsModel } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserProfileInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserProfileOutput {}

@Injectable()
export class GetUserProfileService extends BaseUseCaseService<
  GetUserProfileInput,
  GetUserProfileOutput
> {
  constructor(private readonly userDomainService: UserDomainsService) {
    super();
  }
  async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const { username, requestingUserId } = input;
    const { profileUser, isOwner, isFriend, relationship } =
      await this.userDomainService.getProfileAndRelationship(
        username,
        requestingUserId,
      );

    const settings = profileUser.privacySettings;

    const profileResponse: UserProfileWithRelationshipExceptFriendsModel<string> =
      {
        _id: profileUser._id.toString(),
        firstName: profileUser.firstName,
        lastName: profileUser.lastName,
        username: profileUser.username,
        avatar: profileUser.avatar,
        coverPhoto: profileUser.coverPhoto,
        bio: profileUser.bio,
        work: undefined,
        currentLocation: undefined,
        friendCount: undefined,
        privacySettings: profileUser.privacySettings,
        relationship: relationship,
      };

    if (this.userDomainService.canView(settings.work, isOwner, isFriend)) {
      profileResponse.work = profileUser.work;
    }
    if (
      this.userDomainService.canView(
        settings.currentLocation,
        isOwner,
        isFriend,
      )
    ) {
      profileResponse.currentLocation = profileUser.currentLocation;
    }
    if (
      this.userDomainService.canView(settings.friendList, isOwner, isFriend)
    ) {
      profileResponse.friendCount = profileUser.friendCount;
    }

    return profileResponse;
  }
}

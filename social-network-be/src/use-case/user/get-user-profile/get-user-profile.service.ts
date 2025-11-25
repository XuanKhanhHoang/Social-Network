import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserProfileWithRelationshipModel } from 'src/domains/user/interfaces';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import {
  getVietnamProvinceByCode,
  VietnamProvince,
} from 'src/share/utils/is-province-code';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserProfileInput {
  username: string;
  requestingUserId?: string;
}
export type GetUserProfileOutput = Omit<
  UserProfileWithRelationshipModel<Types.ObjectId>,
  'provinceCode' | 'relationship'
> & {
  province?: VietnamProvince;
  relationship: {
    status: FriendshipStatus;
    requesterId: string;
    recipientId: string;
  };
};

@Injectable()
export class GetUserProfileService extends BaseUseCaseService<
  GetUserProfileInput,
  GetUserProfileOutput
> {
  constructor(
    private readonly userDomainService: UserDomainsService,
    private readonly friendshipService: FriendshipRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }
  async execute(input: GetUserProfileInput): Promise<GetUserProfileOutput> {
    const { username, requestingUserId } = input;
    const profileUser =
      await this.userRepository.findProfileByUsername(username);

    const settings = profileUser.privacySettings;

    const isOwner = profileUser._id.toString() === requestingUserId;
    const isFriend = await this.friendshipService.areFriends(
      profileUser._id.toString(),
      requestingUserId,
    );
    const relationshipObject = await this.friendshipService.findRelationship(
      profileUser._id.toString(),
      requestingUserId,
    );
    const relationship = relationshipObject?.status;
    const profileResponse: GetUserProfileOutput = {
      ...profileUser,
      work: undefined,
      currentLocation: undefined,
      friendCount: undefined,
      province: undefined,
      relationship: {
        status: relationship,
        requesterId: relationshipObject?.requester.toString(),
        recipientId: relationshipObject?.recipient.toString(),
      },
    };

    const elementsCanView = this.userDomainService.getElementsCanView(
      profileUser,
      settings,
      isOwner,
      isFriend,
    );
    let province: VietnamProvince | undefined;
    if (elementsCanView.provinceCode) {
      province = getVietnamProvinceByCode(+elementsCanView.provinceCode);
    }
    delete elementsCanView.provinceCode;
    return { ...profileResponse, ...elementsCanView, province };
  }
}

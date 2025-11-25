import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import {
  getVietnamProvinceByCode,
  VietnamProvince,
} from 'src/share/utils/is-province-code';

import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserBioInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserBioOutput {
  bio?: string;
  work?: string;
  province?: VietnamProvince;
  currentLocation?: string;
}

@Injectable()
export class GetUserBioService extends BaseUseCaseService<
  GetUserBioInput,
  GetUserBioOutput
> {
  constructor(
    private readonly userDomainsService: UserDomainsService,
    private readonly userRepository: UserRepository,
    private readonly friendshipService: FriendshipRepository,
  ) {
    super();
  }
  async execute(input: GetUserBioInput): Promise<GetUserBioOutput> {
    const { username, requestingUserId } = input;
    const profileUser =
      await this.userRepository.findProfileByUsername(username);

    if (!profileUser) {
      throw new NotFoundException('User not found');
    }
    const isFriend = await this.friendshipService.areFriends(
      profileUser._id.toString(),
      requestingUserId,
    );
    const isOwner = profileUser._id.toString() === requestingUserId;
    const elementsCanView = this.userDomainsService.getElementsCanView(
      profileUser,
      profileUser.privacySettings,
      isOwner,
      isFriend,
    );
    let province: VietnamProvince | undefined;
    if (elementsCanView.provinceCode) {
      province = getVietnamProvinceByCode(+elementsCanView.provinceCode);
    }
    delete elementsCanView.provinceCode;
    return { ...elementsCanView, bio: profileUser.bio, province };
  }
}

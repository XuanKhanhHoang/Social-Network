import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FriendshipRepository } from 'src/domains/friendship/friendship.repository';
import { SubMediaModel } from 'src/domains/media-upload/interfaces/media';
import { UserDomainsService } from 'src/domains/user/user-domains.service';
import { UserRepository } from 'src/domains/user/user.repository';
import { FriendshipStatus } from 'src/share/enums/friendship-status';
import { BaseUseCaseService } from 'src/use-case/base.use-case.service';

export interface GetUserHeaderInput {
  username: string;
  requestingUserId?: string;
}
export interface GetUserHeaderOutput {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: SubMediaModel<Types.ObjectId>;
  coverPhoto?: SubMediaModel<Types.ObjectId>;
  relationship: {
    status: FriendshipStatus;
    requesterId: string;
    recipientId: string;
  };
  friendCount?: number;
}
@Injectable()
export class GetUserHeaderService extends BaseUseCaseService<
  GetUserHeaderInput,
  GetUserHeaderOutput
> {
  constructor(
    private readonly userDomainService: UserDomainsService,
    private readonly userRepository: UserRepository,
    private readonly friendshipService: FriendshipRepository,
  ) {
    super();
  }
  async execute(input: GetUserHeaderInput): Promise<GetUserHeaderOutput> {
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
    const relationship = await this.friendshipService.findRelationship(
      profileUser._id.toString(),
      requestingUserId,
    );
    if (
      this.userDomainService.canView(
        profileUser.privacySettings.friendList,
        isOwner,
        isFriend,
      )
    ) {
      return {
        _id: profileUser._id.toString(),
        firstName: profileUser.firstName,
        lastName: profileUser.lastName,
        username: profileUser.username,
        avatar: profileUser.avatar,
        coverPhoto: profileUser.coverPhoto,
        relationship: {
          status: relationship?.status || null,
          requesterId: relationship?.requester.toString() || null,
          recipientId: relationship?.recipient.toString() || null,
        },
        friendCount: profileUser.friendCount,
      };
    }
    return {
      _id: profileUser._id.toString(),
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      username: profileUser.username,
      avatar: profileUser.avatar,
      coverPhoto: profileUser.coverPhoto,
      relationship: {
        status: relationship?.status || null,
        requesterId: relationship?.requester.toString() || null,
        recipientId: relationship?.recipient.toString() || null,
      },
    };
  }
}

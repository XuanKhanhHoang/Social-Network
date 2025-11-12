import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileAndRelationship } from './interfaces';
import { RelationshipType } from './interfaces/relationship.type';
import { UserPrivacy } from 'src/share/enums';
import { UserRepository } from './user.repository';

@Injectable()
export class UserDomainsService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfileAndRelationship(
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
      (await this.userRepository.areFriends(
        requestingUserId,
        profileUserIdStr,
      ));

    const relationship: RelationshipType = isOwner
      ? 'OWNER'
      : isFriend
        ? 'FRIEND'
        : 'PUBLIC';
    if (
      relationship === 'FRIEND' &&
      this.canView(profileUser.privacySettings.friendList, isOwner, isFriend)
    )
      return {
        profileUser,
        isOwner,
        isFriend,
        relationship,
        friendCount: profileUser.friendCount,
      };
    return { profileUser, isOwner, isFriend, relationship };
  }

  async generateUniqueUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const baseUsername = (firstName + lastName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

    let username = baseUsername;
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
      if (attempt > 0) {
        const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
        username = baseUsername + randomSuffix;
      }
      const existingUser = await this.userRepository.findByUsername(username);

      if (!existingUser) {
        isUnique = true;
      }
      attempt++;
      if (attempt > 10) {
        throw new Error('Cannot generate unique username');
      }
    }
    return username;
  }

  canView(
    fieldPrivacy: UserPrivacy,
    isOwner: boolean,
    isFriend: boolean,
  ): boolean {
    if (isOwner) return true;

    switch (fieldPrivacy) {
      case UserPrivacy.PUBLIC:
        return true;
      case UserPrivacy.FRIENDS:
        return isFriend;
      case UserPrivacy.PRIVATE:
        return false;
      default:
        return false;
    }
  }
}

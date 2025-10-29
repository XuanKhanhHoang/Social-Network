import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDocument } from 'src/schemas';
import { UserRepository } from './user-repository.service';
import {
  CreateUserData,
  ProfileAndRelationship,
  UserHeaderWithRelationship,
  UserBio,
  UserProfileResponse,
} from './interfaces';
import { RelationshipType } from './interfaces/relationship.type';
import { UserPrivacy } from 'src/share/enums';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnverifiedAccounts() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleteCriteria = {
      isVerified: false,
      createdAt: { $lt: twentyFourHoursAgo },
    };

    const { deletedCount } =
      await this.userRepository.deleteMany(deleteCriteria);

    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} unverified accounts.`);
    }
  }

  async create(input: CreateUserData): Promise<UserDocument> {
    const { birthDate, firstName, gender, lastName, email, password } = input;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await this.generateUniqueUsername(firstName, lastName);

    const userPayload: CreateUserData = {
      firstName,
      email,
      password: hashedPassword,
      lastName,
      gender,
      birthDate,
      isVerified: false,
      username,
    };

    return this.userRepository.createUser(userPayload);
  }

  async markUserAsVerified(userId: string): Promise<UserDocument> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = true;
    return this.userRepository.save(user);
  }

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
  ): Promise<{
    total: number;
    friends: any[];
  }> {
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
      !this.canView(profileUser.privacySettings.friendList, isOwner, isFriend)
    ) {
      throw new ForbiddenException("You cannot view this user's friend list");
    }

    const userWithFriends = await this.userRepository.findFriendsListById(
      profileUser._id,
      limit,
    );

    const friends = userWithFriends ? userWithFriends.friends : [];

    return {
      total: profileUser.friendCount,
      friends: friends,
    };
  }

  async getUserHeader(
    username: string,
    requestingUserId: string | null,
  ): Promise<UserHeaderWithRelationship> {
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
  ): Promise<UserBio> {
    const { profileUser, isOwner, isFriend } =
      await this.getProfileAndRelationship(username, requestingUserId);

    const settings = profileUser.privacySettings;
    const response: UserBio = {
      bio: profileUser.bio,
    };

    if (this.canView(settings.work, isOwner, isFriend)) {
      response.work = profileUser.work;
    }
    if (this.canView(settings.currentLocation, isOwner, isFriend)) {
      response.currentLocation = profileUser.currentLocation;
    }

    return response;
  }

  async getProfileByUsername(
    username: string,
    requestingUserId: string | null,
  ): Promise<UserProfileResponse> {
    const { profileUser, isOwner, isFriend } =
      await this.getProfileAndRelationship(username, requestingUserId);

    const settings = profileUser.privacySettings;

    const profileResponse: UserProfileResponse = {
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
    };

    if (this.canView(settings.work, isOwner, isFriend)) {
      profileResponse.work = profileUser.work;
    }
    if (this.canView(settings.currentLocation, isOwner, isFriend)) {
      profileResponse.currentLocation = profileUser.currentLocation;
    }
    if (this.canView(settings.friendList, isOwner, isFriend)) {
      profileResponse.friendCount = profileUser.friendCount;
    }

    return profileResponse;
  }

  async getVisiblePrivacyLevels(
    username: string,
    requestingUserId: string | null,
  ): Promise<{
    targetUserId: string;
    visiblePrivacyLevels: UserPrivacy[];
  }> {
    const user = await this.userRepository.findUserIdByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const targetUserId = user._id.toString();

    const isOwner = requestingUserId && targetUserId === requestingUserId;
    const isFriend =
      !isOwner &&
      requestingUserId &&
      (await this.areFriends(requestingUserId, targetUserId));

    const visiblePrivacyLevels = [UserPrivacy.PUBLIC];
    if (isOwner) {
      visiblePrivacyLevels.push(UserPrivacy.FRIENDS, UserPrivacy.PRIVATE);
    } else if (isFriend) {
      visiblePrivacyLevels.push(UserPrivacy.FRIENDS);
    }

    return {
      targetUserId: targetUserId,
      visiblePrivacyLevels,
    };
  }

  //**Helper functions */

  private async generateUniqueUsername(
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
      (await this.areFriends(requestingUserId, profileUserIdStr));

    const relationship: RelationshipType = isOwner
      ? 'OWNER'
      : isFriend
        ? 'FRIEND'
        : 'PUBLIC';

    return { profileUser, isOwner, isFriend, relationship };
  }

  private canView(
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

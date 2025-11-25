import { Injectable } from '@nestjs/common';
import { UserPrivacy } from 'src/share/enums';
import { UserRepository } from './user.repository';
import { PrivacySettings, UserDocument } from 'src/schemas';

@Injectable()
export class UserDomainsService {
  constructor(private readonly userRepository: UserRepository) {}

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
  getElementsCanView(
    elements: Pick<
      UserDocument,
      'friendCount' | 'work' | 'currentLocation' | 'provinceCode'
    > & { friendsList?: any } & any,
    privacySettings: PrivacySettings,
    isOwner: boolean,
    isFriend: boolean,
  ) {
    const { friendCount, work, currentLocation, provinceCode, friendsList } =
      elements;
    const response: Partial<
      Pick<
        UserDocument,
        'friendCount' | 'work' | 'currentLocation' | 'provinceCode'
      > & { friendsList?: any }
    > = {};
    if (this.canView(privacySettings.friendCount, isOwner, isFriend)) {
      response.friendCount = friendCount;
    }
    if (this.canView(privacySettings.work, isOwner, isFriend)) {
      response.work = work;
    }
    if (this.canView(privacySettings.currentLocation, isOwner, isFriend)) {
      response.currentLocation = currentLocation;
    }
    if (this.canView(privacySettings.provinceCode, isOwner, isFriend)) {
      response.provinceCode = provinceCode;
    }
    if (this.canView(privacySettings.friendList, isOwner, isFriend)) {
      response.friendsList = friendsList;
    }
    return response;
  }
}

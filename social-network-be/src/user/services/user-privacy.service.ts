import { Injectable } from '@nestjs/common';
import { UserPrivacy } from 'src/share/enums';

@Injectable()
export class UserPrivacyService {
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

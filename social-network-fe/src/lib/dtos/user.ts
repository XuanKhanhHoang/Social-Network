import { Gender } from '../constants/enums';
import { VisibilityPrivacy } from '../constants/enums/visibility-privacy';
import { PrivacySettings } from '../interfaces/user';
import { CursorPaginationResponse } from './common/pagination';

export interface UserSummaryDto {
  _id: string;
  username: string;
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  firstName: string;
  lastName: string;
}
export interface UserSummaryWithEmailDto extends UserSummaryDto {
  email: string;
}
export type UserSummaryWithAvatarUrlDto = Omit<UserSummaryDto, 'avatar'> & {
  avatar?: string;
};

export interface GetUserHeaderResponseDto {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  coverPhoto?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  relationship: 'PUBLIC' | 'FRIEND' | 'OWNER';
  friendCount?: number;
}

export interface PrivacySettingsDto {
  work: VisibilityPrivacy;
  currentLocation: VisibilityPrivacy;
  friendList: VisibilityPrivacy;
}

export interface GetUserProfileResponseDto {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  coverPhoto?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  bio?: string;
  work?: string;
  currentLocation?: string;
  friendCount?: number;
  privacySettings: PrivacySettingsDto;
  relationship: 'PUBLIC' | 'FRIEND' | 'OWNER';
}

export interface GetUserBioResponseDto {
  bio?: string;
  work?: string;
  currentLocation?: string;
}

export interface GetUserFriendsPreviewResponseDto
  extends CursorPaginationResponse<UserSummaryDto> {
  total: number;
}

export interface PhotoDto {
  _id: string;
  mediaType: string;
  url: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export type GetUserPhotosResponseDto = CursorPaginationResponse<PhotoDto>;

export interface UpdateProfileRequestDto {
  avatar?: string | null;
  coverPhoto?: string | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
}

export interface UpdateProfileResponseDto {
  _id: string;
  avatar?: string | null;
  coverPhoto?: string | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
  username: string;
}
export interface GetAccountResponseDto {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: Date;
  gender: Gender;
  privacy: PrivacySettings;
}
export interface UpdateAccountResponseDto {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: Date;
  gender: Gender;
  privacy: PrivacySettings;
}
export interface UpdateAccountRequestDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
  birthDate?: Date;
  gender?: Gender;
  privacy?: Partial<PrivacySettings>;
}

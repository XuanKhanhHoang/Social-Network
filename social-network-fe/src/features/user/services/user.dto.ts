import { Gender } from '@/lib/constants/enums';
import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';
import { VisibilityPrivacy } from '@/lib/constants/enums/visibility-privacy';
import { Province } from '@/lib/interfaces';
import { VietnamProvince } from '@/lib/interfaces/common';
import { PrivacySettings } from '@/features/user/types';
import { CursorPaginationResponse } from '@/services/common/pagination';

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
  _id: string;
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
  relationship: {
    status: FriendshipStatus;
    requesterId: string;
    recipientId: string;
  } | null;
  friendCount?: number;
}

export interface PrivacySettingsDto {
  work: VisibilityPrivacy;
  currentLocation: VisibilityPrivacy;
  friendList: VisibilityPrivacy;
  provinceCode: VisibilityPrivacy;
  friendCount: VisibilityPrivacy;
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
  province?: Province;
  friendCount?: number;
  privacySettings: PrivacySettingsDto;
  relationship: FriendshipStatus | null;
}

export interface GetUserBioResponseDto {
  bio?: string;
  work?: string;
  currentLocation?: string;
  province: VietnamProvince;
}

export interface GetUserFriendsPreviewResponseDto
  extends CursorPaginationResponse<UserSummaryDto> {
  total: number;
}

export type GetSuggestFriendsResponseDto =
  CursorPaginationResponse<UserSummaryDto>;

export interface PhotoDto {
  _id: string;
  mediaId: string;
  mediaType: string;
  url: string;
  width?: number;
  height?: number;
  createdAt: string;
  caption?: string;
  order?: number;
  postId: string;
}

export type GetUserPhotosResponseDto = CursorPaginationResponse<PhotoDto>;

export interface UpdateProfileRequestDto {
  avatar?: string | null;
  coverPhoto?: string | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
  provinceCode?: string | null;
}

export interface UpdateProfileResponseDto {
  _id: string;
  avatar?: {
    mediaId: string;
    url: string;
    width?: number;
    height?: number;
  } | null;
  coverPhoto?: {
    mediaId: string;
    url: string;
    width?: number;
    height?: number;
  } | null;
  bio?: string;
  work?: string;
  currentLocation?: string;
  provinceCode?: string | null;
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

import { VisibilityPrivacy } from '../constants/enums/visibility-privacy';
import { CursorPaginationResponse } from './common/pagination';

export interface UserSummaryDto {
  _id: string;
  username: string;
  avatar?: string;
  firstName: string;
  lastName: string;
}

export interface GetUserHeaderResponseDto {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  coverPhoto?: string;
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
  avatar?: string;
  coverPhoto?: string;
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
}

export type GetUserPhotosResponseDto = CursorPaginationResponse<PhotoDto>;

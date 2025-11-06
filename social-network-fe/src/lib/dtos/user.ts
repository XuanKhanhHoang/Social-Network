import { UserRelationship } from '../constants/enums/user-relationship';
import { VisibilityPrivacy } from '../constants/enums/visibility-privacy';

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
  relationship: UserRelationship;
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
}

export interface GetUserBioResponseDto {
  bio?: string;
  work?: string;
  currentLocation?: string;
}

export interface GetUserFriendsPreviewResponseDto {
  total: number;
  data: UserSummaryDto[];
  pagination: {
    hasNextPage: boolean;
  };
}

interface PhotoDto {
  mediaId: string;
  mediaType: string;
  url: string;
}

export interface GetUserPhotosResponseDto {
  total: number;
  data: PhotoDto[];
  pagination: {
    hasNextPage: boolean;
  };
}

import { Gender, VisibilityPrivacy } from '../constants/enums';
import {
  GetAccountResponseDto,
  GetUserBioResponseDto,
  GetUserHeaderResponseDto,
  GetUserProfileResponseDto,
  PhotoDto,
  UserSummaryWithAvatarUrlDto,
} from '../dtos';

export function transformToUserSummary(
  user: unknown & {
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
): UserSummary {
  return {
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.lastName + ' ' + user.firstName,
  };
}
export function transformToUserSummaryWithEmail(
  user: unknown & {
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
    email: string;
  }
): UserSummaryWithEmail {
  return {
    ...transformToUserSummary(user),
    email: user.email,
  };
}
export interface UserSummary {
  id: string;
  username: string;
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    mediaId?: string;
  };
  firstName: string;
  lastName: string;
  fullName: string;
}
export type UserSummaryWidthAvatarUrl = Omit<UserSummary, 'avatar'> & {
  avatar?: string;
};
export function transformToUserSummaryWidthAvatarUrl(
  user: UserSummaryWithAvatarUrlDto
): UserSummaryWidthAvatarUrl {
  return {
    ...transformToUserSummary({ ...user, avatar: undefined }),
    avatar: user.avatar,
  };
}
export interface UserSummaryWithEmail extends UserSummary {
  email: string;
}

export function transformToUserHeader(
  userDto: GetUserHeaderResponseDto
): UserHeader {
  return {
    firstName: userDto.firstName,
    lastName: userDto.lastName,
    username: userDto.username,
    avatar: userDto.avatar,
    coverPhoto: userDto.coverPhoto,
    headerType: userDto.relationship,
    friendCount: userDto.friendCount,
  };
}
export interface UserHeader {
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
  headerType: 'PUBLIC' | 'FRIEND' | 'OWNER';
  friendCount?: number;
}

export type PrivacySettings = {
  work: VisibilityPrivacy;
  currentLocation: VisibilityPrivacy;
  friendList: VisibilityPrivacy;
};

export function transformAndGetUserProfile(
  GetUserHeaderResponseDto: GetUserProfileResponseDto
): UserProfile {
  return {
    firstName: GetUserHeaderResponseDto.firstName,
    lastName: GetUserHeaderResponseDto.lastName,
    username: GetUserHeaderResponseDto.username,
    avatar: GetUserHeaderResponseDto.avatar,
    coverPhoto: GetUserHeaderResponseDto.coverPhoto,
    bio: GetUserHeaderResponseDto.bio,
    work: GetUserHeaderResponseDto.work,
    currentLocation: GetUserHeaderResponseDto.currentLocation,
    privacySettings: GetUserHeaderResponseDto.privacySettings,
    friendCount: GetUserHeaderResponseDto.friendCount,
    fullName:
      GetUserHeaderResponseDto.lastName +
      ' ' +
      GetUserHeaderResponseDto.firstName,
    userProfileType: GetUserHeaderResponseDto.relationship,
  };
}
export type UserProfile = {
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
  privacySettings: PrivacySettings;
  fullName: string;
  userProfileType: 'PUBLIC' | 'FRIEND' | 'OWNER';
};

export function transformToUserBio(bio: GetUserBioResponseDto): UserBio {
  return {
    bio: bio.bio,
    work: bio.work,
    currentLocation: bio.currentLocation,
  };
}
export type UserBio = {
  bio?: string;
  work?: string;
  currentLocation?: string;
};

export function transformToUserPreviewPhoto(photo: PhotoDto): UserPhoto {
  return {
    mediaId: photo._id,
    mediaType: photo.mediaType,
    url: photo.url,
    width: photo.width,
    height: photo.height,
    createAt: photo.createdAt,
  };
}
export type UserPhoto = {
  mediaId: string;
  mediaType: string;
  url: string;
  width?: number;
  height?: number;
  createAt: string;
};

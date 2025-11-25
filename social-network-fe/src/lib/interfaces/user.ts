import { Gender, VisibilityPrivacy } from '../constants/enums';
import { FriendshipStatus } from '../constants/enums/friendship-status';
import {
  GetAccountResponseDto,
  GetUserBioResponseDto,
  GetUserHeaderResponseDto,
  GetUserProfileResponseDto,
  PhotoDto,
  UserSummaryWithAvatarUrlDto,
} from '../dtos';
import { VietnamProvince } from './common';
import { Province } from './other';

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
    id: userDto._id,
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
  id: string;
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
  headerType: {
    status: FriendshipStatus;
    requesterId: string;
    recipientId: string;
  } | null;
  friendCount?: number;
}

export type PrivacySettings = {
  work: VisibilityPrivacy;
  currentLocation: VisibilityPrivacy;
  friendList: VisibilityPrivacy;
  provinceCode: VisibilityPrivacy;
  friendCount: VisibilityPrivacy;
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
    province: GetUserHeaderResponseDto.province,
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
  province?: Province;
  friendCount?: number;
  privacySettings: PrivacySettings;
  fullName: string;
  userProfileType: FriendshipStatus | null;
};

export function transformToUserBio(bio: GetUserBioResponseDto): UserBio {
  return {
    bio: bio.bio,
    work: bio.work,
    currentLocation: bio.currentLocation,
    province: bio.province,
  };
}
export type UserBio = {
  bio?: string;
  work?: string;
  currentLocation?: string;
  province?: VietnamProvince;
};

export function transformToUserPreviewPhoto(photo: PhotoDto): UserPhoto {
  return {
    id: photo._id,
    mediaType: photo.mediaType,
    url: photo.url,
    width: photo.width,
    height: photo.height,
    createAt: photo.createdAt,
    caption: photo.caption,
    order: photo.order,
    postId: photo.postId,
  };
}
export type UserPhoto = {
  id: string;
  mediaType: string;
  url: string;
  width?: number;
  height?: number;
  createAt: string;
  caption?: string;
  order?: number;
  postId: string;
};
export function transformToUserAccount(
  user: GetAccountResponseDto
): UserAccount {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    birthDate: user.birthDate,
    gender: user.gender,
    privacy: user.privacy,
  };
}
export type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  birthDate: Date;
  gender: Gender;
  privacy: PrivacySettings;
};

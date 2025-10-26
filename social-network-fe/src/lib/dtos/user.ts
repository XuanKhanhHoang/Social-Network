import { UserPrivacy } from '../constants/enums';

interface PrivacySettingsDto {
  bio: UserPrivacy;
  work: UserPrivacy;
  currentLocation: UserPrivacy;
  friendList: UserPrivacy;
}

interface UserProfileDto {
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  coverPhoto: string;
  createdAt: Date;
  bio: string;
  work: string;
  currentLocation: string;
  friendCount: number;
  email: string;
  phoneNumber: string | null;
  privacySettings: PrivacySettingsDto;
}

export type PublicProfileResponseDto = Pick<
  UserProfileDto,
  'firstName' | 'lastName' | 'username' | 'avatar' | 'coverPhoto' | 'createdAt'
>;

type FriendFieldsDto = Pick<
  UserProfileDto,
  'bio' | 'work' | 'currentLocation' | 'friendCount'
>;

export type FriendProfileResponseDto = PublicProfileResponseDto &
  Partial<FriendFieldsDto>;

export type OwnerProfileResponseDto = Pick<
  UserProfileDto,
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'avatar'
  | 'coverPhoto'
  | 'createdAt'
  | 'bio'
  | 'work'
  | 'currentLocation'
  | 'friendCount'
  | 'email'
  | 'phoneNumber'
  | 'privacySettings'
>;
export type GetProfileResponseDto =
  | PublicProfileResponseDto
  | FriendProfileResponseDto
  | OwnerProfileResponseDto;

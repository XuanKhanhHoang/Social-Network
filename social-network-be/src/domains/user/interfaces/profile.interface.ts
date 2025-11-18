import { Types } from 'mongoose';
import { PrivacySettings } from 'src/schemas';
import { RelationshipType } from './relationship.type';

export interface UserBasicProfile {
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
}
export interface UserProfile {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  coverPhoto?: string;
  privacySettings: PrivacySettings;
  friendCount: number;
  bio: string;
  work: string;
  currentLocation: string;
  friends: Types.ObjectId[];
}

export interface ProfileAndRelationship {
  profileUser: UserProfile;
  isOwner: boolean;
  isFriend: boolean;
  relationship: RelationshipType;
  friendCount?: number;
}

export interface UserHeaderWithRelationship extends UserBasicProfile {
  relationship: RelationshipType;
  coverPhoto: string;
  friendCount?: number;
}

export interface UserBio {
  bio: string;
  work?: string;
  currentLocation?: string;
}

export interface PublicUserProfile
  extends Pick<
    UserProfile,
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'avatar'
    | 'coverPhoto'
    | 'privacySettings'
  > {}

export interface FriendUserProfile extends PublicUserProfile {
  bio?: string;
  work?: string;
  currentLocation?: string;
  friendCount?: number;
}
export type OwnerUserProfile = UserProfile;

export type UserProfileResponse = { relationship: RelationshipType } & (
  | FriendUserProfile
  | OwnerUserProfile
  | PublicUserProfile
);

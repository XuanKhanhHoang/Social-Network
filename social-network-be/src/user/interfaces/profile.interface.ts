import { Types } from 'mongoose';
import { PrivacySettings } from 'src/schemas';
import { RelationshipType } from './relationship.type';

export interface UserProfileData {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  coverPhoto: string;
  privacySettings: PrivacySettings;
  friendCount: number;
  bio: string;
  work: string;
  currentLocation: string;
  friends: Types.ObjectId[];
  createdAt: Date;
}

export interface ProfileAndRelationship {
  profileUser: UserProfileData;
  isOwner: boolean;
  isFriend: boolean;
  relationship: RelationshipType;
}

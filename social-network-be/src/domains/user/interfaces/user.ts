import { Types } from 'mongoose';
import { SubUser, UserDocument } from 'src/schemas';
import { FriendshipStatus } from 'src/share/enums/friendship-status';

export type SubUserModel<T extends string | Types.ObjectId> = Omit<
  SubUser,
  '_id'
> & {
  _id: T;
};
export type UserMinimalModel<T extends string | Types.ObjectId> = Pick<
  UserDocument,
  'username' | 'avatar' | 'firstName' | 'lastName'
> & {
  _id: T;
};
export type UserMinimalModelWithLastActiveTime<
  T extends string | Types.ObjectId,
> = Pick<
  UserDocument,
  'username' | 'avatar' | 'firstName' | 'lastName' | 'lastActiveAt'
> & {
  _id: T;
};
export type UserMinimalWithEmailModel<T extends string | Types.ObjectId> =
  UserMinimalModel<T> & Pick<UserDocument, 'email'>;

export type UserProfileModel<T extends string | Types.ObjectId> = Pick<
  UserDocument,
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'avatar'
  | 'coverPhoto'
  | 'privacySettings'
  | 'friendCount'
  | 'bio'
  | 'work'
  | 'currentLocation'
  | 'provinceCode'
> & {
  _id: T;
};

export type UserBioModel = Pick<
  UserDocument,
  'bio' | 'work' | 'currentLocation' | 'provinceCode'
>;
export type UserProfileWithRelationshipModel<
  T extends string | Types.ObjectId,
> = UserProfileModel<T> & {
  relationship: FriendshipStatus | null;
};

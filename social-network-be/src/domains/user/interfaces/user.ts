import { Types } from 'mongoose';
import { SubUser, UserDocument } from 'src/schemas';

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
  | 'friends'
> & {
  _id: T;
};

export type UserBioModel = Pick<
  UserDocument,
  'bio' | 'work' | 'currentLocation'
>;
export type UserProfileWithRelationshipExceptFriendsModel<
  T extends string | Types.ObjectId,
> = Omit<UserProfileModel<T>, 'friends'> & {
  relationship: 'OWNER' | 'FRIEND' | 'PUBLIC';
};

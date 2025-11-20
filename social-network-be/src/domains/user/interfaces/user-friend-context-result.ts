import { Types } from 'mongoose';
import { UserDocument } from 'src/schemas';

export type UserFriendsContextResult = Pick<
  UserDocument,
  'friendCount' | 'privacySettings'
> & {
  _id: Types.ObjectId;
};

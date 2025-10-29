import { Types } from 'mongoose';
import { PrivacySettings } from 'src/schemas';

export interface PopulatedFriend {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
}

export interface UserFriendsData {
  _id: Types.ObjectId;
  friends: PopulatedFriend[];
}

export interface UserFriendsContextData {
  _id: Types.ObjectId;
  friendCount: number;
  privacySettings: Pick<PrivacySettings, 'friendList'>;
}

import { UserProfileModel } from './user';
import { Types } from 'mongoose';

export interface GetProfileAndRelationshipResult {
  profileUser: UserProfileModel<Types.ObjectId>;
  isOwner: boolean;
  isFriend: boolean;
  relationship: 'OWNER' | 'FRIEND' | 'PUBLIC';
  friendCount?: number;
}

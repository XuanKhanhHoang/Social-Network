import { Types } from 'mongoose';
import { FriendshipStatus } from 'src/share/enums/friendship-status';

export interface FriendshipDocumentModel<T extends Types.ObjectId | string> {
  requester: T;
  recipient: T;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

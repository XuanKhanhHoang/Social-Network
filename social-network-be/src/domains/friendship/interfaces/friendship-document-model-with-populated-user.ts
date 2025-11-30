import { UserMinimalModelWithLastActiveTime } from 'src/domains/user/interfaces';
import { FriendshipDocumentModel } from './friendship-document-model';
import { Types } from 'mongoose';

export interface FriendshipDocumentModelWithPopulatedUser<
  T extends Types.ObjectId | string,
> extends Omit<FriendshipDocumentModel<T>, 'requester' | 'recipient'> {
  requester: UserMinimalModelWithLastActiveTime<T>;
  recipient: UserMinimalModelWithLastActiveTime<T>;
}

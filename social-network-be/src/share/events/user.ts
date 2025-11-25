import { makeEventTree } from '../utils/makeEventTree';

const User = makeEventTree('user', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
  friendCountChanged: 'friendCountChanged',
} as const);
export const UserEvents = User.events;
export const UserEvent = User.key;

export type UserUpdatedEventPayload = {
  userId: string;
  newData: {
    avatar?: string | null;
    firstName?: string;
    lastName?: string;
    username?: string;
    friendCountDelta?: number;
  };
};
export type UserFriendCountChangedEventPayload = {
  userId: string;
  newData: {
    friendCountDelta?: number;
  };
};

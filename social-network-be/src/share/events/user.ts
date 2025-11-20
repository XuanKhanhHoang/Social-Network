import { makeEventTree } from '../utils/makeEventTree';

const User = makeEventTree('user', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
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
  };
};

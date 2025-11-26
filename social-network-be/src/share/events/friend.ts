import { makeEventTree } from '../utils/makeEventTree';

const Friend = makeEventTree('friend', {
  requestSent: 'requestSent',
  requestAccepted: 'requestAccepted',
  removed: 'removed',
} as const);

export const FriendEvents = Friend.events;
export const FriendEvent = Friend.key;

export type FriendRequestSentEventPayload = {
  requestId: string;
  senderId: string;
  receiverId: string;
};

export type FriendRequestAcceptedEventPayload = {
  friendshipId: string;
  userId: string;
  friendId: string;
};

export type FriendRemovedEventPayload = {
  userId: string;
  friendId: string;
};

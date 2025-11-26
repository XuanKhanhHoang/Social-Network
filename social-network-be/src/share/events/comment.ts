import { makeEventTree } from '../utils/makeEventTree';

const Comment = makeEventTree('comment', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
  replyCreated: 'replyCreated',
  liked: 'liked',
} as const);
export const CommentEvents = Comment.events;
export const CommentEvent = Comment.key;

export type CommentLikedEventPayload = {
  commentId: string;
  postId: string;
  userId: string;
  ownerId: string;
};

export type CommentReplyCreatedEventPayload = {
  replyId: string;
  commentId: string;
  userId: string;
  contentSnippet?: string;
};

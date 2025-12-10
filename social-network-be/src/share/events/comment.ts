import { makeEventTree } from '../utils/makeEventTree';
import { ReactionType } from '../enums';

const Comment = makeEventTree('comment', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
  replyCreated: 'replyCreated',
  reacted: 'reacted',
} as const);
export const CommentEvents = Comment.events;
export const CommentEvent = Comment.key;

export type CommentReactedEventPayload = {
  commentId: string;
  postId: string;
  userId: string;
  ownerId: string;
  reactionType: ReactionType;
};

export type CommentReplyCreatedEventPayload = {
  replyId: string;
  commentId: string;
  userId: string;
  ownerId: string;
  postId: string;
  contentSnippet?: string;
};

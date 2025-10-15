import { makeEventTree } from './makeTree';

const Comment = makeEventTree('comment', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
} as const);
export const CommentEvents = Comment.events;
export const CommentEvent = Comment.key;

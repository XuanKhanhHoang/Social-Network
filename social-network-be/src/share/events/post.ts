import { makeEventTree } from '../utils/makeEventTree';
import { ReactionType } from '../enums';

const Post = makeEventTree('post', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
  reacted: 'reacted',
  commented: 'commented',
} as const);
export const PostEvents = Post.events;
export const PostEvent = Post.key;

export type PostCreatedEventPayload = {
  postId: string;
  authorId: string;
};

export type PostReactedEventPayload = {
  postId: string;
  userId: string;
  ownerId: string;
  reactionType: ReactionType;
};

export type PostCommentedEventPayload = {
  commentId: string;
  postId: string;
  userId: string;
  ownerId: string;
  contentSnippet?: string;
};

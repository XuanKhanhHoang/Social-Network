import { makeEventTree } from '../utils/makeEventTree';

const Post = makeEventTree('post', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
  liked: 'liked',
  commented: 'commented',
} as const);
export const PostEvents = Post.events;
export const PostEvent = Post.key;

export type PostCreatedEventPayload = {
  postId: string;
  authorId: string;
};

export type PostLikedEventPayload = {
  postId: string;
  userId: string;
  ownerId: string;
  type: string;
};

export type PostCommentedEventPayload = {
  commentId: string;
  postId: string;
  userId: string;
  ownerId: string;
  contentSnippet?: string;
};

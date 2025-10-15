import { makeEventTree } from './makeTree';

const Post = makeEventTree('post', {
  created: 'created',
  removed: 'removed',
  updated: 'updated',
} as const);
export const PostEvents = Post.events;
export const PostEvent = Post.key;

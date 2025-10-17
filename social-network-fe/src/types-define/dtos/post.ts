import { PostVisibility, ReactionType } from '@/lib/constants/enums';
import { JSONContent } from '@tiptap/react';
import { Comment } from './comment';
import { CursorPaginationResponse } from './pagination';

export type CreatePostDto = {
  content: Record<string, unknown>;
  backgroundValue?: string;
  media?: PostMediaDto[];
  visibility?: PostVisibility;
};
export type PostMediaDto = {
  id: string;
  caption?: string;
};

export type Post = {
  _id: string;
  author: PostAuthor;
  content: JSONContent;
  backgroundValue: string;
  media: PostMediaItem[];
  visibility: 'public' | 'private' | 'friends';
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  hashtags: string[];
  myReaction?: ReactionType;
  status: 'active' | 'inactive' | 'deleted';
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};
export interface ReactionsBreakdown {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}
export type PostWithTopComment = Post & {
  topComment?: Comment;
};

export type PostAuthor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
};
export type PostMediaItem = {
  mediaId: string;
  url: string;
  mediaType: string;
  caption?: string;
};
export type PostListResponse = CursorPaginationResponse<PostWithTopComment>;

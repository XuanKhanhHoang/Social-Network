import { JSONContent } from '@tiptap/react';

export type PostStatus = 'active' | 'deleted' | 'archived';

export interface PostMedia {
  url: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

export interface PostAuthor {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface AdminPost {
  id: string;
  author: PostAuthor;
  content: JSONContent | null;
  plainText: string;
  media: PostMedia[];
  visibility: string;
  status: PostStatus;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  deletedAt: Date | null;
  pendingReportsCount: number;
}

export interface AdminPostsResult {
  posts: AdminPost[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface DeletePostResult {
  success: boolean;
  message: string;
  totalReportsResolved: number;
}

export interface RestorePostResult {
  success: boolean;
  message: string;
}

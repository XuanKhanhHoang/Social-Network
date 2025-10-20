import { JSONContent } from '@tiptap/react';
import { PostAuthor, ReactionsBreakdown } from './post';
import { ReactionType } from '@/lib/constants/enums';
import { CursorPaginationResponse } from './pagination';

export type CreateCommentDto = {
  content?: Record<string, unknown>;
  postId: string;
  mediaId?: string;
  parentId?: string;
};
export type UpdateCommentDto = Omit<CreateCommentDto, 'postId'>;
export type Comment = {
  content?: JSONContent;
  media?: { url: string; mediaType: string };
  _id: string;
  author: PostAuthor;
  createdAt: string;
  reactionsCount: number;
  myReaction?: ReactionType;
  reactionsBreakdown: ReactionsBreakdown;
  repliesCount: number;
};
export type CommentWithParentId = Comment & {
  parentId?: string;
};

export type CommentWithoutAuthor = Omit<Comment, 'author'>;
export type GetCommentListResponse = CursorPaginationResponse<Comment>;

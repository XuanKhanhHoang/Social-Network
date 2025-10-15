import { JSONContent } from '@tiptap/react';
import { PostAuthor, ReactionsBreakdown } from './post';
import { ReactionType } from '@/lib/constants/enums';

export type CreateCommentDto = {
  content?: Record<string, unknown>;
  postId: string;
  mediaId?: string;
};
export type UpdateCommentDto = Omit<CreateCommentDto, 'postId'>;
export type Comment = {
  content?: JSONContent;
  media?: { url: string; mediaType: string };
  _id: string;
  author: PostAuthor;
  createdAt: string;
  reactionsCount: number;
  userReactionType?: ReactionType;
  reactionsBreakdown: ReactionsBreakdown;
};

export type CommentWithoutAuthor = Omit<Comment, 'author'>;

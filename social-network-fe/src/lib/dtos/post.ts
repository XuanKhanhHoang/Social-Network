import { MediaType } from '@/lib/constants/enums';
import { JSONContent } from '@tiptap/react';
import { UserSummaryDto } from './user';
import { ReactionsBreakdownDto } from './reaction';
import { PostStatus } from '../constants/enums/post-status';
import { CursorPaginationResponse } from './common/pagination';
import { VisibilityPrivacy } from '../constants/enums/visibility-privacy';
import { CommentWithMyReactionDto } from './comment';

export interface CreatePostRequestDto {
  content?: JSONContent;
  backgroundValue?: string;
  media?: PostMediaCreateRequestDto[];
  visibility?: VisibilityPrivacy;
}
export interface PostMediaCreateRequestDto {
  mediaId: string;
  caption?: string;
  order?: number;
}

export interface UpdatePostRequestDto {
  content?: JSONContent;
  backgroundValue?: string;
  media?: PostMediaCreateRequestDto[] | null;
  visibility?: VisibilityPrivacy;
}

export interface GetPostsRequestDto {
  cursor?: string;
  limit?: number;
}

export type CreatePostResponseDto = PostDto;
export type UpdatePostResponseDto = PostDto;

export interface PostMediaDto {
  mediaId: string;
  mediaType: MediaType;
  url: string;
  caption?: string;
  order: number;
}

export interface PostDto {
  _id: string;
  author: UserSummaryDto;
  content: JSONContent;
  backgroundValue?: string;
  media?: PostMediaDto[];
  visibility: VisibilityPrivacy;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  hashtags: string[];
  location?: string;
  status: PostStatus;
  reactionsBreakdown: ReactionsBreakdownDto;
  hotScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithMyReactionDto extends PostDto {
  myReaction: keyof ReactionsBreakdownDto | null;
}

export interface PostWithTopCommentDto extends PostWithMyReactionDto {
  topComment: CommentWithMyReactionDto | null;
}

export type GetPostsFeedResponseDto =
  CursorPaginationResponse<PostWithTopCommentDto>;

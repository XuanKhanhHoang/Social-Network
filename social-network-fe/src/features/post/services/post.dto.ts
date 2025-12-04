import { MediaType } from '@/lib/constants/enums';
import { JSONContent } from '@tiptap/react';
import { UserSummaryWithAvatarUrlDto } from '@/features/user/services/user.dto';
import { ReactionsBreakdownDto } from '@/features/reaction/services/reaction.dto';
import { PostStatus } from '@/lib/constants/enums/post-status';
import { CursorPaginationResponse } from '@/services/common/pagination';
import { VisibilityPrivacy } from '@/lib/constants/enums/visibility-privacy';
import { CommentWithMyReactionDto } from '@/features/comment/services/comment.dto';

export interface CreatePostRequestDto {
  content?: JSONContent;
  backgroundValue?: string;
  media?: PostMediaCreateRequestDto[];
  visibility?: VisibilityPrivacy;
  parentPostId?: string;
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
  width?: number;
  height?: number;
}

export interface PostDto {
  _id: string;
  author: UserSummaryWithAvatarUrlDto;
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
  parentPost?: PostDto;
  isDeleted?: boolean;
}

export interface PostWithMyReactionDto extends PostDto {
  myReaction: keyof ReactionsBreakdownDto | null;
}

export interface PostWithTopCommentDto extends PostWithMyReactionDto {
  topComment: CommentWithMyReactionDto | null;
}

export type GetPostsFeedResponseDto =
  CursorPaginationResponse<PostWithTopCommentDto>;

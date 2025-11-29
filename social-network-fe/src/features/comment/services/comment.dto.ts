import { JSONContent } from '@tiptap/react';
import { UserSummaryWithAvatarUrlDto } from '@/features/user/services/user.dto';
import { ReactionsBreakdownDto } from '@/features/reaction/services/reaction.dto';
import { CursorPaginationResponse } from '@/services/common/pagination';

export interface CreateCommentRequestDto {
  postId: string;
  content?: JSONContent;
  mediaId?: string;
  parentId?: string;
}

export interface UpdateCommentRequestDto {
  content?: JSONContent;
  mediaId?: string;
}
export interface CommentMediaDto {
  mediaId: string;
  mediaType: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
}

export interface CommentDto {
  _id: string;
  postId: string;
  author: UserSummaryWithAvatarUrlDto;
  content: JSONContent;
  media?: CommentMediaDto;
  parentId?: string;
  reactionsCount: number;
  repliesCount: number;
  engagementScore: number;
  reactionsBreakdown: ReactionsBreakdownDto;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithMyReactionDto extends CommentDto {
  myReaction: keyof ReactionsBreakdownDto | null;
}

export type GetCommentsResponseDto =
  CursorPaginationResponse<CommentWithMyReactionDto>;

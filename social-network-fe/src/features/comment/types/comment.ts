import { ReactionsBreakdown } from '@/features/reaction/types/reaction';
import {
  transformToUserSummaryWidthAvatarUrl,
  UserSummaryWidthAvatarUrl,
} from '@/features/user/types';
import { MediaType, ReactionType } from '@/lib/constants/enums';
import { JSONContent } from '@tiptap/react';
import {
  CommentDto,
  CommentWithMyReactionDto,
} from '@/features/comment/services/comment.dto';

export function transformToComment(comment: CommentDto): Comment {
  const media = comment.media
    ? {
        mediaId: comment.media.mediaId,
        mediaType: comment.media.mediaType as unknown as MediaType,
        url: comment.media.url,
      }
    : undefined;
  return {
    id: comment._id,
    postId: comment.postId,
    author: transformToUserSummaryWidthAvatarUrl(comment.author),
    content: comment.content,
    media,
    parentId: comment.parentId,
    reactionsCount: comment.reactionsCount,
    repliesCount: comment.repliesCount,
    engagementScore: comment.engagementScore,
    reactionsBreakdown: comment.reactionsBreakdown,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}
export function transformToCommentWithMyReaction(
  comment: CommentWithMyReactionDto
): CommentWithMyReaction {
  return {
    ...transformToComment(comment),
    myReaction: comment.myReaction as unknown as ReactionType | null,
  };
}
export interface Comment {
  id: string;
  postId: string;
  author: UserSummaryWidthAvatarUrl;
  content: JSONContent;
  media?: CommentMedia;
  parentId?: string;
  reactionsCount: number;
  repliesCount: number;
  engagementScore: number;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: string;
  updatedAt: string;
}
export interface CommentMedia {
  mediaId: string;
  mediaType: MediaType;
  url: string;
  width?: number;
  height?: number;
}
export interface CommentWithMyReaction extends Comment {
  myReaction: ReactionType | null;
}

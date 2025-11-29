import { JSONContent } from '@tiptap/react';
import {
  MediaType,
  PostStatus,
  ReactionType,
  VisibilityPrivacy,
} from '@/lib/constants/enums';
import {
  transformToUserSummaryWidthAvatarUrl,
  UserSummaryWidthAvatarUrl,
} from '@/features/user/types';
import { ReactionsBreakdown } from '@/features/reaction/types/reaction';
import {
  PostDto,
  PostWithMyReactionDto,
  PostWithTopCommentDto,
} from '@/features/post/services/post.dto';
import {
  CommentWithMyReaction,
  transformToCommentWithMyReaction,
} from '@/features/comment/types/comment';

export function transformToPost(post: PostDto): Post {
  return {
    id: post._id,
    author: transformToUserSummaryWidthAvatarUrl(post.author),
    content: post.content,
    backgroundValue: post.backgroundValue,
    sharesCount: post.sharesCount,
    tags: post.tags,
    hashtags: post.hashtags,
    location: post.location,
    status: post.status,
    reactionsBreakdown: post.reactionsBreakdown,
    hotScore: post.hotScore,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    media: post.media,
    visibility: post.visibility,
    reactionsCount: post.reactionsCount,
    commentsCount: post.commentsCount,
  };
}
export function transformToPostWithMyReaction(
  post: PostWithMyReactionDto
): PostWithMyReaction {
  return {
    ...transformToPost(post),
    myReaction: post.myReaction as unknown as ReactionType | null,
  };
}
export function transformToPostWithTopComment(
  post: PostWithTopCommentDto
): PostWithTopComment {
  return {
    ...transformToPostWithMyReaction(post),
    topComment: post.topComment
      ? transformToCommentWithMyReaction(post.topComment)
      : null,
  };
}
export interface PostMedia {
  mediaId: string;
  mediaType: MediaType;
  url: string;
  caption?: string;
  order: number;
  width?: number;
  height?: number;
}
export interface Post {
  id: string;
  author: UserSummaryWidthAvatarUrl;
  content: JSONContent;
  backgroundValue?: string;
  media?: PostMedia[];
  visibility: VisibilityPrivacy;
  reactionsCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  hashtags: string[];
  location?: string;
  status: PostStatus;
  reactionsBreakdown: ReactionsBreakdown;
  hotScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithMyReaction extends Post {
  myReaction: ReactionType | null;
}

export interface PostWithTopComment extends PostWithMyReaction {
  topComment: CommentWithMyReaction | null;
}

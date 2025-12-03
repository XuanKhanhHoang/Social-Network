import { JSONContent } from '@tiptap/react';
import {
  MediaType,
  PostStatus,
  ReactionType,
  VisibilityPrivacy,
} from '@/lib/constants/enums';
import { UserSummaryWidthAvatarUrl } from '@/features/user/types';
import { ReactionsBreakdown } from '@/features/reaction/types/reaction';
import { CommentWithMyReaction } from '@/features/comment/types/comment';
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
  parentPost?: Post;
}

export interface PostWithMyReaction extends Post {
  myReaction: ReactionType | null;
}

export interface PostWithTopComment extends PostWithMyReaction {
  topComment: CommentWithMyReaction | null;
}

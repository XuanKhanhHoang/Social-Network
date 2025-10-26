import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { MediaType, ReactionType } from 'src/share/enums';
import { Author } from 'src/share/dto/res/author';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { MediaResponse } from 'src/share/dto/res/media-response';
import { Comment } from 'src/schemas';
import { Types } from 'mongoose';

export interface CommentCursorData {
  lastPriority: number;
  lastScore: number;
  lastId: string;
}
export interface ReplyCursorData {
  lastPriority: number;
  lastId: string;
}
export type CreateCommentData = {
  authorId: string;
  postId: string;
  content: TiptapDocument;
  parentId?: string;
  mediaId?: string;
};

export type UpdateCommentData = {
  content?: TiptapDocument;
  mediaId?: string | null;
};
export interface AggregatedComment {
  _id: string;
  author: Author;
  content: JSON;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: Date;
  priority: number;
  engagementScore: null;
  media: MediaResponse[];
  mentionedUser: Author | null;
  myReaction: ReactionType | null;
  repliesCount: number;
}
export interface AggregatedReplyComment {
  _id: string;
  author: Author;
  content: JSON;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: Date;
  priority: number;
  engagementScore: null;
  media: MediaResponse[];
  mentionedUser: Author | null;
  myReaction: ReactionType | null;
}
export type CommentWithMedia = Omit<Comment, 'mediaId'> & {
  mediaId: {
    cloudinaryPublicId: string;
    mediaType: MediaType;
    _id: Types.ObjectId;
  };
};

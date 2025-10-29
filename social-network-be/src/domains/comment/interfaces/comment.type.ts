import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { ReactionType } from 'src/share/enums';
import { Author } from 'src/share/dto/res/author';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { Media } from 'src/media-upload/interfaces/type';

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
  content?: TiptapDocument;
  parentId?: string;
  mediaId?: string;
};

export type UpdateCommentData = {
  content?: TiptapDocument;
  mediaId?: string | null;
};
export interface Comment {
  _id: string;
  author: Author;
  content: JSON;
  reactionsCount: number;
  reactionsBreakdown: ReactionsBreakdown;
  createdAt: Date;
  priority: number;
  engagementScore: null;
  mentionedUser: Author | null;
  myReaction: ReactionType | null;
  repliesCount: number;
  mediaId?: string;
  postId: string;
}

export interface ReplyComment extends Omit<CommentWithMedia, 'repliesCount'> {}
export interface CommentWithMedia extends Omit<Comment, 'mediaId'> {
  media?: Media;
}

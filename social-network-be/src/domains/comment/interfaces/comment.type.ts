import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { ReactionType } from 'src/share/enums';
import { Author } from 'src/share/dto/res/author';
import { ReactionsBreakdown } from 'src/share/dto/other/reaction-break-down';
import { MediaBasicData } from 'src/domains/media-upload/interfaces/type';
import { UserBasicData } from 'src/domains/user/interfaces';

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
  author: UserBasicData;
  postId: string;
  content?: TiptapDocument;
  parentId?: string;
  media?: MediaBasicData;
};

export type UpdateCommentData = {
  content?: TiptapDocument;
  mediaId?: string | null;
  commentId: string;
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
  media?: MediaBasicData<string>;
  postId: string;
}

export interface ReplyComment extends Omit<Comment, 'repliesCount'> {}

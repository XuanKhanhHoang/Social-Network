import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { MediaType } from 'src/share/enums';
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

export type CommentWithMedia = Omit<Comment, 'mediaId'> & {
  mediaId: {
    cloudinaryPublicId: string;
    mediaType: MediaType;
    _id: Types.ObjectId;
  };
};

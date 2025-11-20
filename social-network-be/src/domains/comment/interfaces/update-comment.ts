import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';

export type UpdateCommentData = {
  content?: TiptapDocument;
  mediaId?: string | null;
  commentId: string;
};

import { MediaBasicData } from 'src/domains/media-upload/interfaces/type';
import { Types } from 'mongoose';
import { SubUserModel } from 'src/domains/user/interfaces';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';

export type CreateCommentData = {
  author: SubUserModel<string>;
  postId: string;
  content?: TiptapDocument;
  parentId?: string;
  rootId?: Types.ObjectId | null;
  media?: MediaBasicData<string>;
};

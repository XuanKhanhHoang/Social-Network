import { MediaBasicData } from 'src/domains/media-upload/interfaces/type';
import { SubUserModel } from 'src/domains/user/interfaces';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';

export type CreateCommentData = {
  author: SubUserModel<string>;
  postId: string;
  content?: TiptapDocument;
  parentId?: string;
  media?: MediaBasicData<string>;
};

import { MediaBasicDataWithCaption } from 'src/domains/media-upload/interfaces/type';
import { SubUserModel } from 'src/domains/user/interfaces';
import { TiptapDocument } from 'src/share/dto/req/tiptap-content.dto';
import { UserPrivacy } from 'src/share/enums';

export interface CreatePostData {
  author: SubUserModel<string>;
  media: MediaBasicDataWithCaption<string>[];
  content: TiptapDocument;
  plain_text: string;
  backgroundValue?: string;
  visibility?: UserPrivacy;
}

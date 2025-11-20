import { Types } from 'mongoose';
import { SubPostMedia } from 'src/schemas';
import { MediaType } from 'src/share/enums';

export type PostPhotoModel<
  T extends string | Types.ObjectId,
  U extends string | Types.ObjectId,
> = Omit<SubPostMedia, '_id' | 'mediaType'> & {
  _id: T;
  mediaType: MediaType.IMAGE;
  postId: U;
};

import { Types } from 'mongoose';
import { SubMedia } from 'src/schemas';

export type SubMediaModel<T extends string | Types.ObjectId> = Omit<
  SubMedia,
  'mediaId'
> & {
  mediaId: T;
};

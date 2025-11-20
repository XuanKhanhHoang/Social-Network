import { PostPhotoModel } from './post-photo-model';
import { Types } from 'mongoose';

export type FindPhotosForUserResults = {
  photos: PostPhotoModel<Types.ObjectId, Types.ObjectId>[];
  nextCursor: number | null;
};

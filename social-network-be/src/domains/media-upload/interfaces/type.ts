import { Types } from 'mongoose';
import { MediaType } from 'src/share/enums';

export interface MediaUpload {
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  originalFilename: string;
  mediaType: MediaType;
  isConfirmed: boolean;
  userId: string;
  _id: string;
}
export interface Media {
  cloudinaryPublicId: string;
  url: string;
  originalFilename: string;
  mediaType: MediaType;
  isConfirmed: boolean;
  userId: string;
  _id: string;
  createdAt: Date;
}

export interface MediaBasicData<T = string | Types.ObjectId> {
  mediaId: T;
  mediaType: MediaType;
  url: string;
  width?: number;
  height?: number;
}
export interface MediaBasicDataWithCaption<T> extends MediaBasicData<T> {
  caption?: string;
  order?: number;
}
export interface MediaBasicDataOnlyIdAndType
  extends Pick<MediaBasicData, 'mediaId' | 'mediaType'> {}

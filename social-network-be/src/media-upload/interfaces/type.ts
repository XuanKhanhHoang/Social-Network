import { MediaType } from 'src/share/enums';

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

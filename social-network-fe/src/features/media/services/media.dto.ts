import { MediaType } from '@/lib/constants/enums';

export interface UploadMediaResponseDto {
  _id: string;
  url: string;
  mediaType: MediaType;
  expiresAt: string;
}

export interface DeleteMediaResponseDto {
  message: string;
}

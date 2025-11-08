import { MediaType } from '@/lib/constants/enums';

export type UIMediaItem = {
  file?: File;
  id?: string;
  mediaType: MediaType;
  url: string;
};
export type MediaItemWithHandlingStatus = UIMediaItem & {
  isUploading?: boolean;
  uploadError?: string;
};

import { MediaType } from '@/lib/constants/enums';

export type UIMediaItem = {
  file?: File;
  id?: string;
  mediaType: MediaType;
  url: string;
  width?: number;
  height?: number;
};
export type MediaItemWithHandlingStatus = UIMediaItem & {
  isUploading?: boolean;
  uploadError?: string;
};

export type MediaItem = {
  id?: string;
  mediaType: string;
  url: string;
  file?: File;
};
export type MediaItemWithHandlingStatus = MediaItem & {
  isUploading?: boolean;
  uploadError?: string;
  confirmError?: string;
  isConfirming?: boolean;
  isConfirmed?: boolean;
};

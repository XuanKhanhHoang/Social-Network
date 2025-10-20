import { MediaItem } from '@/lib/dtos';

export type MediaComponentParams = {
  item: MediaItemWithHandlingStatus;
  className?: {
    container?: string;
    media?: string;
  };
  handle?: {
    onRetryUpload?: () => void;
    onRetryConfirm?: () => void;
    onRemove?: () => void;
  };
  justShow?: boolean;
};

export type UIMediaItem = Omit<MediaItem, 'id'> & {
  file?: File;
  id?: string;
};
export type MediaItemWithHandlingStatus = UIMediaItem & {
  isUploading?: boolean;
  uploadError?: string;
  confirmError?: string;
  isConfirming?: boolean;
  isConfirmed?: boolean;
};

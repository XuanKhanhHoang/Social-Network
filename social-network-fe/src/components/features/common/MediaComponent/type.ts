import { MediaItemWithHandlingStatus } from '@/types-define/types';

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

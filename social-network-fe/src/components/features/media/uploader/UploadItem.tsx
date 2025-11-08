'use client';

import { AlertCircle, Check, Loader, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils/other';
import MediaPreview from '../common/MediaPreview';
import { MediaItemWithHandlingStatus } from '../type';

export type MediaUploadItemProps = {
  item: MediaItemWithHandlingStatus;
  className?: {
    container?: string;
    media?: string;
  };
  handle?: {
    onRetryUpload?: () => void;
    onRemove?: () => void;
  };
};

type MediaRemoveButtonProps = {
  onRemove: () => void;
  disabled: boolean;
};

type MediaUploadStatusProps = {
  item: MediaItemWithHandlingStatus;
  onRetryUpload?: () => void;
};

const MediaRemoveButton = ({ onRemove, disabled }: MediaRemoveButtonProps) => (
  <Button
    variant="secondary"
    size="icon"
    onClick={onRemove}
    className="absolute -top-2 -right-2 rounded-full h-6 w-6 shadow-lg z-20 bg-white disabled:opacity-80 border"
    disabled={disabled}
  >
    <X className="cursor-pointer h-4 w-4 text-black" />
  </Button>
);

const MediaUploadStatus = ({ item, onRetryUpload }: MediaUploadStatusProps) => {
  const hasUploadError = !!item.uploadError;
  const isUploading = !!item.isUploading;
  const isSuccess = !!item.id && !hasUploadError && !isUploading;

  return (
    <>
      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white mb-2" />
          <span className="text-white text-sm font-medium">Đang upload...</span>
        </div>
      )}
      {hasUploadError && (
        <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white mb-2" />
          {onRetryUpload && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onRetryUpload();
              }}
              className="bg-white text-red-600 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Thử lại upload
            </Button>
          )}
        </div>
      )}
      {isSuccess && (
        <div className="absolute top-2 left-2">
          <div className="bg-green-500 rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {formatFileSize(item.file?.size || 0)}
      </div>
      {isUploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full animate-pulse bg-blue-500"
            style={{ width: '60%' }} // TODO: Need real %
          />
        </div>
      )}
    </>
  );
};

const MediaUploadItem = ({
  item,
  className = {},
  handle,
}: MediaUploadItemProps) => {
  const { onRetryUpload, onRemove } = handle || {};
  const isUploading = !!item.isUploading;

  return (
    <div
      className={`relative bg-gray-100 rounded-lg cursor-pointer group ${className.container}`}
    >
      {onRemove && (
        <MediaRemoveButton onRemove={onRemove} disabled={isUploading} />
      )}
      <MediaPreview
        url={item.url}
        mediaType={item.mediaType}
        alt={item.file?.name || 'upload-preview'}
        className={className.media}
      />
      <MediaUploadStatus item={item} onRetryUpload={onRetryUpload} />
    </div>
  );
};

export default MediaUploadItem;

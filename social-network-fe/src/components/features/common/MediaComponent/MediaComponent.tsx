'use client';

import Image from 'next/image';
import { MediaComponentParams } from './type';
import { AlertCircle, Check, Loader, RefreshCw, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils/other';
import { MediaType } from '@/lib/constants/enums';
const MediaComponent = ({
  item,
  className = {},
  handle,
  justShow = false,
}: MediaComponentParams) => {
  const renderMedia = () => {
    if (item.mediaType === MediaType.VIDEO) {
      return (
        <>
          <video
            src={item.url}
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 ${className.media}`}
            muted
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="w-6 h-6 text-gray-800" fill="currentColor" />
            </div>
          </div>
        </>
      );
    }

    return (
      <Image
        src={item.url}
        alt={`uploaded-img`}
        fill
        className={`object-contain ${className.media}`}
      />
    );
  };
  if (justShow) {
    return (
      <div
        className={`relative bg-gray-100 rounded-lg cursor-pointer group ${className.container}`}
      >
        {renderMedia()}
      </div>
    );
  }
  const { onRetryUpload, onRetryConfirm, onRemove } = handle || {};
  const hasUploadError = item.uploadError;
  const hasConfirmError = item.confirmError;
  const isUploading = item.isUploading;
  const isConfirming = item.isConfirming;
  const isSuccess =
    item.isConfirmed ||
    (item.id &&
      !hasUploadError &&
      !isUploading &&
      !hasConfirmError &&
      !isConfirming);

  return (
    <div
      className={`relative bg-gray-100 rounded-lg cursor-pointer group ${className.container}`}
    >
      {onRemove != undefined && (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onRemove()}
          className="absolute -top-2 -right-2 rounded-full h-6 w-6 shadow-lg z-20 bg-white disabled:opacity-80  border"
          disabled={item.isUploading || item.isConfirming}
        >
          <X className=" cursor-pointer h-4 w-4 text-black" />
        </Button>
      )}
      {renderMedia()}

      {/* Upload Status Overlays */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white mb-2" />
          <span className="text-white text-sm font-medium">Đang upload...</span>
        </div>
      )}

      {isConfirming && (
        <div className="absolute inset-0 bg-yellow-500/80 flex flex-col items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-white mb-2" />
          <span className="text-white text-sm font-medium">
            Đang xác nhận...
          </span>
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

      {hasConfirmError && (
        <div className="absolute inset-0 bg-orange-500/80 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white mb-2" />
          <span className="text-white text-xs text-center px-2 mb-2">
            {item.confirmError}
          </span>
          {onRetryConfirm && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onRetryConfirm();
              }}
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Thử lại xác nhận
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

      {/* File size badge */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {formatFileSize(item.file?.size || 0)}
      </div>

      {(isUploading || isConfirming) && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            className={`h-full animate-pulse ${
              isUploading ? 'bg-blue-500' : 'bg-yellow-500'
            }`}
            style={{ width: '60%' }}
          />
        </div>
      )}
    </div>
  );
};
export default MediaComponent;

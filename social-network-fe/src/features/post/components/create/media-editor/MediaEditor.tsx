'use client';
import { useState } from 'react';
import { X, Edit3, ImagePlus, AlertCircle, Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { truncateFileName } from '@/lib/utils/string';
import { formatFileSize } from '@/lib/utils/other';
import {
  MediaItemWithHandlingStatus,
  UIMediaItem,
} from '@/components/features/media/type';
import MediaUploadItem from '@/components/features/media/uploader/UploadItem';
import { MediaGrid } from '@/components/features/media/grid/Grid';
import ContainedMedia from '@/components/features/media/common/ContainedMedia';

export type PostEditorMediaProps = {
  media: MediaItemWithHandlingStatus[];
  handle: {
    onChange: (
      media: UIMediaItem[],
      captions: { [index: number]: string }
    ) => void;
    handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRetryUpload: (index: number) => void;
  };
  captions: Record<number, string>;
};

export default function PostEditorMedia({
  media,
  captions: oCaptions,
  handle: { onChange, handleMediaUpload, onRetryUpload },
}: PostEditorMediaProps) {
  const [captions, setCaptions] = useState<{ [index: number]: string }>(
    oCaptions || {}
  );
  const [isEditing, setIsEditing] = useState(false);

  const clearAll = () => {
    onChange([], {});
    setCaptions({});
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    const newCaptions = { ...captions };
    delete newCaptions[index];

    const reindexedCaptions: { [index: number]: string } = {};
    Object.entries(newCaptions).forEach(([oldIndex, caption]) => {
      const numIndex = parseInt(oldIndex);
      const newIndex = numIndex > index ? numIndex - 1 : numIndex;
      reindexedCaptions[newIndex] = caption;
    });

    setCaptions(reindexedCaptions);
    onChange(newMedia, reindexedCaptions);
  };

  const handleCaptionChange = (index: number, value: string) => {
    const newCaptions = { ...captions, [index]: value };
    setCaptions(newCaptions);
    onChange(media, newCaptions);
  };

  if (media.length === 0) return null;

  const remainingCount = Math.max(0, media.length - 5);
  const hasAnyUploading = media.some((item) => item.isUploading);
  const hasAnyUploadError = media.some((item) => item.uploadError);

  return (
    <div className="relative w-full max-w-[500px] mx-auto mb-4">
      {(hasAnyUploading || hasAnyUploadError) && (
        <div className="mb-2 p-2 rounded-sm bg-gray-50 border space-y-1">
          {hasAnyUploading && (
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Loader className="w-4 h-4 animate-spin" />
              <span>
                Đang upload {media.filter((m) => m.isUploading).length} ảnh...
              </span>
            </div>
          )}

          {hasAnyUploadError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>
                {media.filter((m) => m.uploadError).length} ảnh upload thất bại
              </span>
            </div>
          )}
        </div>
      )}

      <div className=" flex gap-2 z-10 justify-end my-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing(true)}
          className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Chỉnh sửa và thêm chú thích
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
          disabled={hasAnyUploading}
          asChild
        >
          <label className={hasAnyUploading ? 'opacity-50' : ''}>
            <ImagePlus />
            <span className="text-sm font-medium">
              {hasAnyUploading ? 'Đang xử lý...' : 'Ảnh/Video'}
            </span>
            {!hasAnyUploading && (
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
              />
            )}
          </label>
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={clearAll}
          className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm rounded-full h-8 w-8"
        >
          <X className=" cursor-pointer h-4 w-4 text-gray-600" />
        </Button>
      </div>
      {media.length === 1 ? (
        (() => {
          const item = media[0];
          const aspectRatio =
            item.width && item.height
              ? `${item.width} / ${item.height}`
              : '1 / 1';
          return (
            <div className="grid grid-cols-1 gap-0 rounded-sm ">
              <MediaUploadItem
                item={item}
                className={{ container: 'w-full' }}
                style={{ aspectRatio }}
                handle={{
                  onRetryUpload: () => onRetryUpload?.(0),
                  onRemove: () => removeMedia(0),
                }}
              />
            </div>
          );
        })()
      ) : (
        <MediaGrid
          media={media}
          renderItem={(item, index, className) => (
            <MediaUploadItem
              key={index}
              item={item}
              className={{ container: className }}
              handle={{
                onRetryUpload: () => onRetryUpload?.(index),
                onRemove: () => removeMedia(index),
              }}
            />
          )}
        />
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex justify-between items-center">
              Chỉnh sửa ảnh và video
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="bg-white/90 hover:bg-white   h-8 w-8"
              >
                <X className=" cursor-pointer h-4 w-4 text-gray-600" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {media.map((item, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 bg-gray-50 relative"
              >
                {item.isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                    <div className="flex flex-col items-center">
                      <Loader
                        className={`w-6 h-6 animate-spin mb-2 ${
                          item.isUploading ? 'text-blue-600' : 'text-yellow-600'
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        {item.isUploading
                          ? 'Đang upload...'
                          : 'Đang xác nhận...'}
                      </span>
                    </div>
                  </div>
                )}

                {item.uploadError && (
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className={`${
                        item.uploadError
                          ? 'bg-red-100 border-red-300'
                          : 'bg-orange-100 border-orange-300'
                      } border rounded-sm p-2 flex items-center gap-2`}
                    >
                      <AlertCircle
                        className={`w-4 h-4 ${
                          item.uploadError ? 'text-red-600' : 'text-orange-600'
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          item.uploadError ? 'text-red-600' : 'text-orange-600'
                        }`}
                      >
                        {item.uploadError ? 'Upload lỗi' : 'Xác nhận lỗi'}
                      </span>
                      {item.uploadError && onRetryUpload && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRetryUpload(i)}
                          className="h-6 px-2 text-xs"
                          disabled={item.isUploading}
                        >
                          Thử lại
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {item.id && !item.uploadError && !item.isUploading && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-blue-100 border border-blue-300 rounded-full p-1">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-sm overflow-visible">
                    <ContainedMedia
                      url={item.url}
                      mediaType={item.mediaType}
                      width={item?.width || 200}
                      height={item?.height || 200}
                      className="object-contain"
                    />

                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => removeMedia(i)}
                      className="absolute -top-2 -right-2 rounded-full h-6 w-6 shadow-lg"
                      disabled={item.isUploading}
                    >
                      <X className=" cursor-pointer h-4 w-4 text-gray-600" />
                    </Button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-wrap flex items-center gap-2">
                        {truncateFileName(item.file?.name || '', 35)}
                        {item.isUploading && (
                          <Loader
                            className={`w-3 h-3 animate-spin ${
                              item.isUploading
                                ? 'text-blue-600'
                                : 'text-yellow-600'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {formatFileSize(item.file?.size || 0)} •{' '}
                        {item.mediaType === 'video' ? 'Video' : 'Hình ảnh'}
                        {item.uploadError && (
                          <span className="text-red-500 text-xs">
                            • Lỗi upload
                          </span>
                        )}
                        {item.id && !item.uploadError && !item.isUploading && (
                          <span className="text-blue-500 text-xs">
                            • Đã upload
                          </span>
                        )}
                      </div>
                    </div>

                    <Textarea
                      placeholder="Thêm chú thích cho ảnh/video này..."
                      value={captions[i] || ''}
                      onChange={(e) => handleCaptionChange(i, e.target.value)}
                      className="resize-none"
                      rows={3}
                      disabled={item.isUploading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {media.filter((m) => m.id && !m.uploadError).length}/
                {media.length} ảnh đã xử lý
              </div>
              <Button
                onClick={() => setIsEditing(false)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Hoàn tất
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

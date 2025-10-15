import { mediaService } from '@/services/media';
import { MediaItemWithHandlingStatus } from '@/types-define/types';
import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseMediaUploadOptions {
  initialMedia?: MediaItemWithHandlingStatus[];
  initialCaptions?: Record<number, string>;
  maxFiles?: number;
  maxSizeMB?: number;
  onMediaChange?: (
    media: MediaItemWithHandlingStatus[],
    captions: Record<number, string>
  ) => void;
}

export interface UseMediaUploadReturn {
  media: MediaItemWithHandlingStatus[];
  captions: Record<number, string>;
  setMedia: React.Dispatch<React.SetStateAction<MediaItemWithHandlingStatus[]>>;
  setCaptions: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleMediaChange: (
    newMedia: MediaItemWithHandlingStatus[],
    newCaptions: Record<number, string>
  ) => void;
  updateMediaItem: (
    index: number,
    updates: Partial<MediaItemWithHandlingStatus>
  ) => void;
  retryUpload: (index: number) => void;
  retryConfirm: (index: number) => void;
  confirmMediaItem: (index: number) => Promise<void>;
  confirmAllUnconfirmed: () => Promise<{
    success: boolean;
    failedIndices: number[];
    updatedMedia: MediaItemWithHandlingStatus[];
  }>;
  hasUploadingFiles: boolean;
  hasUploadErrors: boolean;
  hasConfirmErrors: boolean;
  hasUnconfirmedMedia: boolean;
}

export function useMediaUpload(
  options: UseMediaUploadOptions = {}
): UseMediaUploadReturn {
  const {
    initialMedia = [],
    initialCaptions = {},
    maxFiles = 10,
    maxSizeMB = 200,
    onMediaChange,
  } = options;

  const [media, setMedia] =
    useState<MediaItemWithHandlingStatus[]>(initialMedia);
  const [captions, setCaptions] =
    useState<Record<number, string>>(initialCaptions);

  const mediaRef = useRef<MediaItemWithHandlingStatus[]>(media);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  const updateMediaItem = useCallback(
    (index: number, updates: Partial<MediaItemWithHandlingStatus>) => {
      setMedia((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const uploadFileToTemp = useCallback(
    async (index: number, file?: File) => {
      if (!file || file.size === 0) return;

      try {
        updateMediaItem(index, {
          isUploading: true,
          uploadError: undefined,
        });

        const response = await mediaService.uploadTempMedia(file);

        updateMediaItem(index, {
          id: response.id,
          url: response.url,
          isUploading: false,
        });
      } catch (error) {
        console.error('Upload temp failed:', error);
        updateMediaItem(index, {
          isUploading: false,
          uploadError:
            error instanceof Error
              ? error.message
              : 'Upload thất bại. Thử lại?',
        });
      }
    },
    [updateMediaItem]
  );

  const confirmMediaItem = useCallback(
    async (index: number) => {
      const item = media[index];
      if (!item.id || item.isConfirmed) return;

      try {
        updateMediaItem(index, {
          isConfirming: true,
          confirmError: undefined,
        });

        await mediaService.confirmMedia(item.id);

        updateMediaItem(index, {
          isConfirming: false,
          isConfirmed: true,
        });
      } catch (error) {
        console.error('Confirm media failed:', error);
        updateMediaItem(index, {
          isConfirming: false,
          confirmError:
            error instanceof Error ? error.message : 'Xác nhận ảnh thất bại',
        });
      }
    },
    [media, updateMediaItem]
  );

  const handleMediaUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const files = Array.from(e.target.files);

      if (media.length + files.length > maxFiles) {
        alert(`Bạn chỉ có thể chọn tối đa ${maxFiles} ảnh`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          alert(
            `File ${file.name} quá lớn. Kích thước tối đa là ${maxSizeMB}MB.`
          );
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      const newMediaItems: MediaItemWithHandlingStatus[] = validFiles.map(
        (file) => ({
          url: URL.createObjectURL(file),
          mediaType: file.type.startsWith('image/') ? 'image' : 'video',
          file,
          isUploading: true,
        })
      );

      const startIndex = media.length;
      setMedia((prev) => [...prev, ...newMediaItems]);

      validFiles.forEach((file, index) => {
        uploadFileToTemp(startIndex + index, file);
      });

      e.target.value = '';
    },
    [media, uploadFileToTemp, maxFiles, maxSizeMB]
  );

  const handleMediaChange = useCallback(
    (
      newMedia: MediaItemWithHandlingStatus[],
      newCaptions: Record<number, string>
    ) => {
      const removedItems = media.filter(
        (oldItem) => !newMedia.some((newItem) => newItem.url === oldItem.url)
      );

      removedItems.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
        if (item.id && !item.isConfirmed) {
          mediaService.cancelTempMedia(item.id).catch(console.warn);
        }
      });

      setMedia(newMedia);
      setCaptions(newCaptions);

      if (onMediaChange) {
        onMediaChange(newMedia, newCaptions);
      }
    },
    [media, onMediaChange]
  );

  const retryUpload = useCallback(
    (index: number) => {
      const item = media[index];
      if (item && item.uploadError) {
        uploadFileToTemp(index, item.file);
      }
    },
    [media, uploadFileToTemp]
  );

  const retryConfirm = useCallback(
    (index: number) => {
      const item = media[index];
      if (item && item.confirmError && item.id) {
        confirmMediaItem(index);
      }
    },
    [confirmMediaItem, media]
  );

  const confirmAllUnconfirmed = useCallback(async () => {
    const currentMedia = mediaRef.current;
    const unconfirmedMedia = currentMedia.filter(
      (m) => m.id && !m.uploadError && !m.isUploading && !m.isConfirmed
    );

    if (unconfirmedMedia.length === 0) {
      return {
        success: true,
        failedIndices: [],
        updatedMedia: currentMedia,
      };
    }

    const updatedMedia = [...currentMedia];
    const confirmPromises = unconfirmedMedia.map(async (item) => {
      const index = currentMedia.findIndex((m) => m === item);
      try {
        updateMediaItem(index, { isConfirming: true });
        await mediaService.confirmMedia(item.id!);
        updateMediaItem(index, {
          isConfirming: false,
          isConfirmed: true,
        });
        updatedMedia[index] = {
          ...updatedMedia[index],
          isConfirming: false,
          isConfirmed: true,
        };
        return { success: true, index };
      } catch (error) {
        console.error(`Confirm media ${item.id} failed:`, error);
        updateMediaItem(index, {
          isConfirming: false,
          confirmError: 'Xác nhận ảnh thất bại',
        });
        updatedMedia[index] = {
          ...updatedMedia[index],
          isConfirming: false,
          confirmError: 'Xác nhận ảnh thất bại',
        };
        return { success: false, index };
      }
    });

    const results = await Promise.allSettled(confirmPromises);
    const failedIndices = results
      .filter(
        (result) => result.status === 'fulfilled' && !result.value.success
      )
      .map(
        (result) =>
          (
            result as PromiseFulfilledResult<{
              success: boolean;
              index: number;
            }>
          ).value.index
      );

    return {
      success: failedIndices.length === 0,
      failedIndices,
      updatedMedia,
    };
  }, [updateMediaItem]);

  const hasUploadingFiles = media.some((m) => m.isUploading);
  const hasUploadErrors = media.some((m) => m.uploadError);
  const hasConfirmErrors = media.some((m) => m.confirmError);
  const hasUnconfirmedMedia = media.some((m) => m.id && !m.isConfirmed);

  return {
    media,
    captions,
    setMedia,
    setCaptions,
    handleMediaUpload,
    handleMediaChange,
    updateMediaItem,
    retryUpload,
    retryConfirm,
    confirmMediaItem,
    confirmAllUnconfirmed,
    hasUploadingFiles,
    hasUploadErrors,
    hasConfirmErrors,
    hasUnconfirmedMedia,
  };
}

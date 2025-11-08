import { MediaItemWithHandlingStatus } from '@/components/features/media/type';
import { MediaType } from '@/lib/constants/enums';
import { mediaService } from '@/services/media';
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
  hasUploadingFiles: boolean;
  hasUploadErrors: boolean;
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
        console.log(file);
        const response = await mediaService.uploadMedia(file);

        updateMediaItem(index, {
          _id: response._id,
          url: response.url,
          isUploading: false,
        });
      } catch (error) {
        console.error('Upload temp failed:', error);
        updateMediaItem(index, {
          isUploading: false,
          uploadError: 'Upload thất bại. Thử lại?',
        });
      }
    },
    [updateMediaItem]
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
          mediaType: file.type.startsWith('image/')
            ? MediaType.IMAGE
            : MediaType.VIDEO,
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

  const hasUploadingFiles = media.some((m) => m.isUploading);
  const hasUploadErrors = media.some((m) => m.uploadError);

  return {
    media,
    captions,
    setMedia,
    setCaptions,
    handleMediaUpload,
    handleMediaChange,
    updateMediaItem,
    retryUpload,
    hasUploadingFiles,
    hasUploadErrors,
  };
}

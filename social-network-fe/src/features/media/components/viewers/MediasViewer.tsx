'use client';

import { PostMedia } from '@/features/post/types/post';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeftCircle, ChevronRightCircle } from 'lucide-react';

export type MediaViewerProps = {
  media: PostMedia[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

type MediaItemProps = {
  item: PostMedia;
  isCurrent: boolean;
  shouldLoad: boolean;
};

function MediaItem({ item, isCurrent, shouldLoad }: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (item.mediaType !== 'video' || !videoRef.current) return;

    if (isCurrent) {
      videoRef.current.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Video play failed:', err);
        }
      });
    } else {
      videoRef.current.pause();
    }
  }, [isCurrent, item.mediaType]);

  const hasDimensions =
    typeof item?.width === 'number' && typeof item?.height === 'number';

  return (
    <div className="relative w-full h-full flex-shrink-0 flex items-center justify-center ">
      {shouldLoad ? (
        <>
          {item.mediaType === 'image' ? (
            hasDimensions ? (
              <Image
                src={item.url}
                alt={item.caption || 'Post media'}
                width={item.width}
                height={item.height}
                className="max-h-full max-w-full object-contain"
                priority={isCurrent}
                loading={isCurrent ? undefined : 'lazy'}
                sizes="100vw"
              />
            ) : (
              <Image
                src={item.url}
                alt={item.caption || 'Post media'}
                fill
                className="max-h-full max-w-full object-contain"
                priority={isCurrent}
                loading={isCurrent ? undefined : 'lazy'}
                sizes="100vw"
              />
            )
          ) : (
            <video
              ref={videoRef}
              src={item.url}
              {...(hasDimensions && {
                width: item.width,
                height: item.height,
              })}
              className="max-h-full max-w-full object-contain"
              controls
              playsInline
              muted
              loop
              preload="metadata"
            />
          )}
        </>
      ) : null}
    </div>
  );
}

export default function MediasViewer({
  media,
  currentIndex,
  onIndexChange,
  onClose,
}: MediaViewerProps) {
  const [expandedCaption, setExpandedCaption] = useState<number | null>(null);

  const nextMedia = () => {
    if (currentIndex < media.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  useEffect(() => {
    setExpandedCaption(null);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextMedia();
      } else if (e.key === 'ArrowLeft') {
        prevMedia();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, media.length]);

  const currentMediaItem = media[currentIndex];

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <motion.div
        className="flex w-full h-full"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        // Đã xóa các props drag, dragConstraints, dragElastic ở đây
      >
        {media.map((item, index) => {
          // Logic tính toán: Chỉ render item hiện tại và 1 item trước/sau nó
          const shouldLoad = Math.abs(currentIndex - index) <= 1;

          return (
            <MediaItem
              key={item.mediaId}
              item={item}
              isCurrent={index === currentIndex}
              shouldLoad={shouldLoad}
            />
          );
        })}
      </motion.div>

      {media.length > 1 && currentIndex > 0 && (
        <button
          aria-label="Previous media"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20"
          onClick={prevMedia}
        >
          <ChevronLeftCircle
            size={32}
            className="text-white/60 hover:text-white/90 transition-colors"
            strokeWidth={1.5}
          />
        </button>
      )}

      {media.length > 1 && currentIndex < media.length - 1 && (
        <button
          aria-label="Next media"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20"
          onClick={nextMedia}
        >
          <ChevronRightCircle
            size={32}
            className="text-white/60 hover:text-white/90 transition-colors"
            strokeWidth={1.5}
          />
        </button>
      )}

      {currentMediaItem?.caption && (
        <div
          className={`absolute bottom-12 left-4 right-4 text-center bg-black/60 text-white text-sm py-2 px-4 rounded-lg z-10 ${
            expandedCaption === currentIndex
              ? 'whitespace-normal break-words max-h-40 overflow-y-auto'
              : 'truncate'
          } cursor-pointer`}
          onClick={() =>
            setExpandedCaption(
              expandedCaption === currentIndex ? null : currentIndex
            )
          }
          title="Click để xem đầy đủ"
        >
          {currentMediaItem.caption}
        </div>
      )}

      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {media.map((_, index) => (
            <div
              key={index}
              className={`w-[6px] h-[6px] rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

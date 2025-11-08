'use client';
import { PostMedia } from '@/lib/interfaces/post';
import { motion } from 'framer-motion';
import { useState } from 'react';

export type MediaViewerProps = {
  media: PostMedia[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};
export default function MediaViewer({
  media,
  currentIndex,
  onIndexChange,
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

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <motion.div
        className="flex w-full h-full"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {media.map((item, index) => (
          <div
            key={item.mediaId}
            className="relative w-full h-full flex-shrink-0 flex items-center justify-center"
          >
            {item.mediaType === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <video
                src={item.url}
                className="max-h-full max-w-full object-contain"
                controls
                autoPlay
                muted
              />
            )}
            {item.caption && (
              <div
                className={`absolute bottom-6 left-0 right-0 px-4 bg-black/60 text-white text-sm py-2 ${
                  expandedCaption === index
                    ? 'whitespace-normal break-words'
                    : 'truncate'
                } cursor-pointer`}
                onClick={() =>
                  setExpandedCaption(expandedCaption === index ? null : index)
                }
                title="Click để xem đầy đủ"
              >
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {/* Nút điều hướng trái */}
      {media.length > 1 && currentIndex > 0 && (
        <svg
          width="24"
          height="24"
          className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:opacity-80"
          onClick={prevMedia}
        >
          <defs>
            <mask id="chevronCutout">
              <circle cx="12" cy="12" r="12" fill="white" />
              <path
                d="M14 8l-4 4 4 4"
                stroke="black"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="12"
            fill="rgba(255,255,255,0.4)"
            mask="url(#chevronCutout)"
          />
        </svg>
      )}

      {/* Nút điều hướng phải */}
      {media.length > 1 && currentIndex < media.length - 1 && (
        <svg
          width="24"
          height="24"
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-all hover:opacity-80"
          onClick={nextMedia}
        >
          <defs>
            <mask id="chevronCutoutRight">
              <circle cx="12" cy="12" r="12" fill="white" />
              <path
                d="M10 8l4 4-4 4"
                stroke="black"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <circle
            cx="12"
            cy="12"
            r="12"
            fill="rgba(255,255,255,0.4)"
            mask="url(#chevronCutoutRight)"
          />
        </svg>
      )}

      {/* Indicator chấm */}
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

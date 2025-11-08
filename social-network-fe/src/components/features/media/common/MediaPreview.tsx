'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { MediaType } from '@/lib/constants/enums';

export type MediaPreviewProps = {
  url: string;
  mediaType: MediaType;
  alt: string;
  className?: string;
};

const MediaPreview = ({
  url,
  mediaType,
  alt,
  className,
}: MediaPreviewProps) => {
  if (mediaType === MediaType.VIDEO) {
    return (
      <>
        <video
          src={url}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 ${className}`}
          muted
        >
          <source src={url} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video tag.
        </video>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="w-6 h-6 text-gray-800" fill="currentColor" />
          </div>
        </div>
      </>
    );
  }

  return (
    <Image src={url} alt={alt} fill className={`object-contain ${className}`} />
  );
};

export default MediaPreview;

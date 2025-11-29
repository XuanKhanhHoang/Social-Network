// components/comment/CommentMedia.tsx
'use client';

import { MediaType } from '@/lib/constants/enums';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type CommentMediaProps = {
  url: string;
  mediaType: MediaType;
  width: number;
  height: number;
  onClick?: () => void;
  className?: string;
};

const ContainedMedia = ({
  url,
  mediaType,
  width,
  height,
  onClick,
  className,
}: CommentMediaProps) => {
  if (mediaType == MediaType.VIDEO) {
  }
  return (
    <Image
      src={url}
      alt="Comment media"
      width={width}
      height={height}
      className={cn(
        'w-full h-auto object-contain max-h-[350px] rounded-lg my-2 cursor-pointer',
        className
      )}
      onClick={onClick}
      sizes="(max-width: 768px) 100vw, 500px"
    />
  );
};

export default ContainedMedia;

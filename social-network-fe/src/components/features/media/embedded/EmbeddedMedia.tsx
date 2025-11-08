'use client';

import { MediaType } from '@/lib/constants/enums';
import MediaPreview from '../common/MediaPreview';

export type EmbeddedMediaProps = {
  url: string;
  mediaType: MediaType;
  alt?: string;
  className?: {
    container?: string;
    media?: string;
  };
};

const EmbeddedMedia = ({
  url,
  mediaType,
  alt = 'embedded-media',
  className = {},
}: EmbeddedMediaProps) => {
  return (
    <div
      className={`relative bg-gray-100 rounded-lg cursor-pointer group ${className.container}`}
    >
      <MediaPreview
        url={url}
        mediaType={mediaType}
        alt={alt}
        className={className.media}
      />
    </div>
  );
};

export default EmbeddedMedia;

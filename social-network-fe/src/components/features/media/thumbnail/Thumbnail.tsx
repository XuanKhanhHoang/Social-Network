import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

type MediaThumbnailProps = {
  url: string;
  mediaType: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  autoPlay?: boolean;
  sizes?: string;
};

function MediaThumbnail({
  url,
  mediaType,
  width,
  height,
  className,
  onClick,
  autoPlay = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: MediaThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function getVideoThumbnail(url: string) {
    const withoutExt = url.replace(/\.mp4$/, '');
    return withoutExt.replace('/upload/', '/upload/so_0,c_fill/') + '.jpg';
  }

  const aspectRatio = width && height ? `${width} / ${height}` : undefined;

  if (mediaType === 'image') {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onClick={onClick}
        style={{ aspectRatio }}
      >
        <Image
          src={url}
          alt=""
          fill
          sizes={sizes}
          className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </div>
    );
  }

  if (mediaType === 'video') {
    if (autoPlay) {
      return (
        <video
          ref={videoRef}
          src={url}
          width={width}
          height={height}
          className={`${className} object-cover cursor-pointer hover:opacity-90 transition-opacity`}
          autoPlay
          muted
          loop
          playsInline
          onClick={onClick}
          style={{ aspectRatio }}
        />
      );
    }

    const thumb = getVideoThumbnail(url);
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        onClick={onClick}
        style={{ aspectRatio }}
      >
        <Image
          src={thumb}
          alt="video thumbnail"
          fill
          sizes={sizes}
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center text-white">
          <PlayCircle height={40} width={40} />
        </span>
      </div>
    );
  }

  return null;
}

export default MediaThumbnail;

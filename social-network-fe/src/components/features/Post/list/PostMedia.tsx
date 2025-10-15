import { PostMediaItem } from '@/types-define/dtos';
import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
type MediaThumbnailProps = {
  url: string;
  mediaType: string;
  className?: string;
  onClick?: () => void;
  autoPlay?: boolean;
};
type PostMediaProps = {
  postId: string;
  media: PostMediaItem[];
};
function MediaThumbnail({
  url,
  mediaType,
  className,
  onClick,
  autoPlay = false,
}: MediaThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function getVideoThumbnail(url: string) {
    const withoutExt = url.replace(/\.mp4$/, '');
    return withoutExt.replace('/upload/', '/upload/so_0,c_fill/') + '.jpg';
  }

  if (mediaType === 'image') {
    return (
      <img
        src={url}
        alt=""
        className={`${className} object-cover cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={onClick}
      />
    );
  }

  if (mediaType === 'video') {
    if (autoPlay) {
      return (
        <video
          ref={videoRef}
          src={url}
          className={`${className} object-cover cursor-pointer hover:opacity-90 transition-opacity`}
          autoPlay
          muted
          loop
          playsInline
          onClick={onClick}
        />
      );
    }

    const thumb = getVideoThumbnail(url);
    return (
      <div
        className={`relative ${className} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={onClick}
      >
        <img
          src={thumb}
          alt="video thumbnail"
          className="w-full h-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center text-white">
          <PlayCircle height={40} width={40} />
        </span>
      </div>
    );
  }

  return null;
}

function PostMedia({ postId, media }: PostMediaProps) {
  const router = useRouter();
  if (!media || media.length === 0) return null;

  const displayMedia = media.slice(0, 6);
  const remainingCount = Math.max(0, media.length - 5);
  const onMediaClick = (postId: string, mediaIndex: number) => {
    router.push(`/post/${postId}?m=${mediaIndex}`);
  };
  switch (media.length) {
    case 1:
      return (
        <div className="  overflow-hidden">
          <MediaThumbnail
            url={displayMedia[0].url}
            mediaType={displayMedia[0].mediaType}
            className="w-full max-h-[500px]"
            // autoPlay={isSingleVideo}
            onClick={() => onMediaClick(postId, 0)}
          />
        </div>
      );

    case 2:
      return (
        <div className="grid grid-cols-2 gap-0.5   overflow-hidden">
          {displayMedia.map((m, index) => (
            <MediaThumbnail
              key={m.mediaId || index}
              url={m.url}
              mediaType={m.mediaType}
              className="w-full h-72"
              onClick={() => onMediaClick(postId, index)}
            />
          ))}
        </div>
      );

    case 3:
      return (
        <div className="grid grid-cols-5 gap-0.5   overflow-hidden">
          <div className="col-span-3">
            <MediaThumbnail
              url={displayMedia[0].url}
              mediaType={displayMedia[0].mediaType}
              className="w-full h-full"
              onClick={() => onMediaClick(postId, 0)}
            />
          </div>
          <div className="col-span-2 grid grid-rows-2 gap-0.5">
            {displayMedia.slice(1).map((m, index) => (
              <MediaThumbnail
                key={m.mediaId || index}
                url={m.url}
                mediaType={m.mediaType}
                className="w-full h-full"
                onClick={() => onMediaClick(postId, index + 1)}
              />
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div className="grid grid-cols-2 gap-0.5   overflow-hidden">
          {displayMedia.map((m, index) => (
            <MediaThumbnail
              key={m.mediaId || index}
              url={m.url}
              mediaType={m.mediaType}
              className="w-full h-48"
              onClick={() => onMediaClick(postId, index)}
            />
          ))}
        </div>
      );

    case 5:
      return (
        <div className="  overflow-hidden">
          <div className="grid grid-cols-8 gap-0.5">
            <div className="col-span-3">
              <MediaThumbnail
                url={displayMedia[0].url}
                mediaType={displayMedia[0].mediaType}
                className="w-full h-full"
                onClick={() => onMediaClick(postId, 0)}
              />
            </div>
            <div className="col-span-3">
              <MediaThumbnail
                url={displayMedia[1].url}
                mediaType={displayMedia[1].mediaType}
                className="w-full h-full"
                onClick={() => onMediaClick(postId, 1)}
              />
            </div>
            <div className="col-span-2 grid grid-rows-3 gap-0.5">
              {displayMedia.slice(2).map((m, index) => (
                <MediaThumbnail
                  key={m.mediaId}
                  url={m.url}
                  mediaType={m.mediaType}
                  className="w-full h-full"
                  onClick={() => onMediaClick(postId, index + 2)}
                />
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="  overflow-hidden">
          <div className="grid grid-cols-3 gap-0.5">
            {displayMedia.slice(0, 5).map((m, index) => (
              <MediaThumbnail
                key={m.mediaId || index}
                url={m.url}
                mediaType={m.mediaType}
                className="w-full h-40"
                onClick={() => onMediaClick(postId, index)}
              />
            ))}
            <div className="relative">
              <MediaThumbnail
                url={displayMedia[5].url}
                mediaType={displayMedia[5].mediaType}
                className="w-full h-40"
                onClick={() => onMediaClick(postId, 5)}
              />
              {remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                  <span className="text-white font-semibold text-xl">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
  }
}

export default PostMedia;

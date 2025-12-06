'use client';

import { PostMedia as PostMediaInterface } from '@/features/post/types/post';
import { useRouter } from 'next/navigation';
import MediaThumbnail from '../thumbnail/Thumbnail';
import { MediaGrid } from '../grid/Grid';
import { cn } from '@/lib/utils';

type PostFeedMediaProps = {
  postId: string;
  media: PostMediaInterface[];
};

function PostFeedMedia({ postId, media }: PostFeedMediaProps) {
  const router = useRouter();
  const onMediaClick = (postId: string, mediaIndex: number) => {
    router.push(`/post/${postId}?m=${mediaIndex}`);
  };

  if (media.length === 1) {
    const item = media[0];
    const aspectRatio =
      item.width && item.height ? `${item.width} / ${item.height}` : '1 / 1';

    return (
      <div className="overflow-hidden rounded-xs">
        <div className="relative w-full max-h-[600px]" style={{ aspectRatio }}>
          <MediaThumbnail
            url={item.url}
            mediaType={item.mediaType}
            width={item.width}
            height={item.height}
            className="w-full h-full"
            onClick={() => onMediaClick(postId, 0)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xs">
      <MediaGrid
        media={media}
        renderItem={(item, index, className) => (
          <MediaThumbnail
            key={item.mediaId || index}
            url={item.url}
            mediaType={item.mediaType}
            width={item.width}
            height={item.height}
            className={cn(className)}
            onClick={() => onMediaClick(postId, index)}
          />
        )}
      />
    </div>
  );
}

export default PostFeedMedia;

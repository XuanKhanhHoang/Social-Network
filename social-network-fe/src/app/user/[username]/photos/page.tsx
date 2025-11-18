'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useUserPhotosPreview } from '@/hooks/user/useUser';
import { useParams } from 'next/navigation';
import { SkeletonUserPhotos } from '@/components/features/media/user/skeleton-photos-preview';
import { transformToUserPreviewPhoto } from '@/lib/interfaces/user';
import { useImageViewer } from '@/components/provider/ImageViewerProvider';

export default function PhotoPage() {
  const params = useParams();
  const username = params.username as string;
  const { data, isLoading, isError } = useUserPhotosPreview(username);
  const { open } = useImageViewer();
  const photos =
    data?.pages
      .flatMap((page) => page.data)
      .map((r) => transformToUserPreviewPhoto(r)) ?? [];
  if (isLoading) return <SkeletonUserPhotos />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả ảnh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos?.length > 0 &&
            photos?.map((photo) => (
              <div
                key={photo.mediaId}
                className="aspect-square relative overflow-hidden rounded-md cursor-pointer"
              >
                <Image
                  src={photo.url}
                  alt={''}
                  fill
                  className="rounded-md object-cover transition-transform hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  onClick={() =>
                    open({
                      imgId: photo.mediaId,
                      url: photo.url,
                      width: photo.width,
                      height: photo.height,
                    })
                  }
                />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

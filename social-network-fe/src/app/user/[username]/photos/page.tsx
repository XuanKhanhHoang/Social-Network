'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useUserPhotosPreview } from '@/features/user/hooks/useUser';
import { useParams } from 'next/navigation';
import { transformToUserPreviewPhoto } from '@/features/user/types';
import { useImageViewer } from '@/components/provider/ImageViewerProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function PhotoPage() {
  const params = useParams();
  const username = params.username as string;
  const { data, isLoading, isError, refetch } = useUserPhotosPreview(username);
  const { open } = useImageViewer();

  if (isLoading) return <PhotoListSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Không thể tải danh sách ảnh.
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const photos =
    data?.pages
      .flatMap((page) => page.data)
      .map((r) => transformToUserPreviewPhoto(r)) ?? [];

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tất cả ảnh</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageOff className="h-12 w-12 mb-4 opacity-50" />
          <p>Người dùng này chưa có ảnh nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả ảnh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square relative overflow-hidden rounded-md cursor-pointer group"
            >
              <Image
                src={photo.url}
                alt="User photo"
                fill
                className="rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                onClick={() =>
                  open({
                    imgId: photo.id,
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
function PhotoListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="aspect-square relative">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

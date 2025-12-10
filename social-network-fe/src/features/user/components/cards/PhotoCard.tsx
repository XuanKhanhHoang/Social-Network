'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPhoto } from '@/features/user/types';
import Image from 'next/image';
import Link from 'next/link';
import { useImageViewer } from '@/components/provider/ImageViewerProvider';

interface PhotosCardProps {
  photos: UserPhoto[];
  username: string;
}

export function PhotosCard({ photos, username }: PhotosCardProps) {
  const { open } = useImageViewer();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Ảnh</CardTitle>
        <Link href={`/user/${username}/photos`} passHref>
          <Button variant="link" className="p-0 h-auto text-blue-500">
            Xem tất cả
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {photos.length > 0 &&
            photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-md overflow-hidden cursor-pointer"
                onClick={() =>
                  open({
                    imgId: photo.id,
                    url: photo.url,
                    width: photo.width,
                    height: photo.height,
                  })
                }
              >
                <Image
                  src={photo.url}
                  alt={`Ảnh ${photo.id}`}
                  width={150}
                  height={150}
                  className="object-cover aspect-square transition-transform hover:scale-110"
                />
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

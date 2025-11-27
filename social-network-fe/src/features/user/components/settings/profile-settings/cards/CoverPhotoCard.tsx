import { useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';
import MediaUploadItem from '@/components/features/media/uploader/UploadItem';
import { MediaItemWithHandlingStatus } from '@/components/features/media/type';
import { UseMediaUploadReturn } from '@/features/media/hooks/useMediaUpload';

interface CoverPhotoCardProps {
  currentCover: MediaItemWithHandlingStatus;
  coverUpload: UseMediaUploadReturn;
}

export function CoverPhotoCard({
  currentCover,
  coverUpload,
}: CoverPhotoCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh bìa</CardTitle>
        <CardDescription>
          Ảnh bìa sẽ hiển thị ở đầu trang cá nhân của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Tải ảnh bìa
        </Button>

        <div className="space-y-2">
          <Label>Xem trước</Label>
          <div className="relative h-[350px] bg-muted rounded-lg border">
            {currentCover ? (
              <MediaUploadItem
                item={currentCover}
                handle={{
                  onRetryUpload: () => coverUpload.retryUpload(0),
                  onRemove: () => coverUpload.setMedia([]),
                }}
                className={{
                  container: 'w-full h-full !rounded-lg',
                  media: '!rounded-lg object-cover',
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <ImagePlus className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={coverUpload.handleMediaUpload}
        />
      </CardContent>
    </Card>
  );
}


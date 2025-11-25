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
import { Upload, User } from 'lucide-react';
import MediaUploadItem from '@/components/features/media/uploader/UploadItem';
import { UseMediaUploadReturn } from '@/hooks/media/useMediaUpload';
import { MediaItemWithHandlingStatus } from '@/components/features/media/type';

interface AvatarCardProps {
  currentAvatar: MediaItemWithHandlingStatus;
  avatarUpload: UseMediaUploadReturn;
}

export function AvatarCard({ currentAvatar, avatarUpload }: AvatarCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh đại diện</CardTitle>
        <CardDescription>
          Ảnh đại diện sẽ hiển thị trên trang cá nhân và bên cạnh các bài viết
          của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-grow space-y-3">
            <Label className="text-sm text-muted-foreground">
              Ảnh xem trước
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Tải ảnh lên
            </Button>
          </div>
          <div className="flex-shrink-0 relative w-24 h-24">
            {currentAvatar ? (
              <MediaUploadItem
                item={currentAvatar}
                handle={{
                  onRetryUpload: () => avatarUpload.retryUpload(0),
                  onRemove: () => avatarUpload.setMedia([]),
                }}
                className={{
                  container: 'w-full h-full',
                  media: 'rounded-full object-cover overflow-hidden',
                }}
                style={{ backgroundColor: 'transparent' }}
                showSize={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-full border-2 border-border overflow-hidden">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={avatarUpload.handleMediaUpload}
        />
      </CardContent>
    </Card>
  );
}

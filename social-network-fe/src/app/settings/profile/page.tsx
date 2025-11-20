'use client';
import { MediaType } from '@/lib/constants/enums';
import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { useStore } from '@/store';
import { useUpdateUserProfile, useUserProfile } from '@/hooks/user/useUser';
import { Loader2 } from 'lucide-react';
import { useMediaUpload } from '@/hooks/media/useMediaUpload';
import { toast } from 'sonner';
import { StoreUser } from '@/store/slices/authSlice';
import { EditProfileSkeleton } from '@/components/features/settings/profile-settings/ProfileSettingsSkeleton';
import { AvatarCard } from '@/components/features/settings/profile-settings/cards/AvatarCard';
import { CoverPhotoCard } from '@/components/features/settings/profile-settings/cards/CoverPhotoCard';
import { BioCard } from '@/components/features/settings/profile-settings/cards/BioCard';

export default function EditProfilePage() {
  const userAuth = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const { data: user, isLoading: isLoadingProfile } = useUserProfile(
    userAuth!.username
  );
  const updateUserProfile = useUpdateUserProfile(userAuth!.username);

  const [isPending, setPending] = useState(false);
  const [bio, setBio] = useState('');
  const [work, setWork] = useState('');
  const [location, setLocation] = useState('');

  const avatarUpload = useMediaUpload({ maxFiles: 1, maxSizeMB: 10 });
  const coverUpload = useMediaUpload({ maxFiles: 1, maxSizeMB: 20 });

  const currentAvatar = avatarUpload.media[0];
  const currentCover = coverUpload.media[0];

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setWork(user.work || '');
      setLocation(user.currentLocation || '');
      if (user.avatar) {
        avatarUpload.setMedia([
          { url: user.avatar.url, mediaType: MediaType.IMAGE },
        ]);
      }
      if (user.coverPhoto) {
        coverUpload.setMedia([
          { url: user.coverPhoto.url, mediaType: MediaType.IMAGE },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let avatarPayload: string | null | undefined = undefined;
    let coverPayload: string | null | undefined = undefined;

    if (currentAvatar && currentAvatar.id) {
      avatarPayload = currentAvatar.id;
    } else if (!currentAvatar && user?.avatar) {
      avatarPayload = null;
    }

    if (currentCover && currentCover.id) {
      coverPayload = currentCover.id;
    } else if (!currentCover && user?.coverPhoto) {
      coverPayload = null;
    }

    const payload = {
      bio,
      work,
      currentLocation: location,
      avatar: avatarPayload,
      coverPhoto: coverPayload,
    };

    setPending(true);
    await updateUserProfile
      .mutateAsync(payload)
      .then((res) => {
        setUser({ ...userAuth, ...res } as StoreUser);
        toast.success('Cập nhật thành công');
      })
      .catch((e) => {
        console.log(e);
        toast.error('Cập nhật thất bại');
      })
      .finally(() => {
        setPending(false);
      });
  };

  if (isLoadingProfile) {
    return <EditProfileSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Chỉnh sửa trang cá nhân</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AvatarCard currentAvatar={currentAvatar} avatarUpload={avatarUpload} />

        <CoverPhotoCard currentCover={currentCover} coverUpload={coverUpload} />

        <BioCard
          bio={bio}
          setBio={setBio}
          work={work}
          setWork={setWork}
          location={location}
          setLocation={setLocation}
        />

        <Card>
          <CardFooter className="pt-6 flex justify-between">
            <Button type="button" variant="outline">
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                avatarUpload.hasUploadingFiles ||
                coverUpload.hasUploadingFiles
              }
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

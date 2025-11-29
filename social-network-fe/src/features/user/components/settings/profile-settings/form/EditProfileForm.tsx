'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { MediaType } from '@/lib/constants/enums';
import { useMediaUpload } from '@/features/media/hooks/useMediaUpload';
import { useUpdateUserProfile } from '@/features/user/hooks/useUser';
import { useStore } from '@/store';
import { StoreUser } from '@/features/auth/store/authSlice';
import { UserProfile } from '@/features/user/types';
import { Province } from '@/lib/interfaces';
import { AvatarCard } from '../cards/AvatarCard';
import { CoverPhotoCard } from '../cards/CoverPhotoCard';
import { BioCard } from '../cards/BioCard';

const profileFormSchema = z.object({
  bio: z.string().max(500, 'Tiểu sử không được quá 500 ký tự').optional(),
  work: z.string().max(100, 'Nơi làm việc quá dài').optional(),
  location: z.string().max(100, 'Nơi sống quá dài').optional(),
  provinceCode: z.number().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  initialData: UserProfile;
  provinces: Province[];
}

export function EditProfileForm({
  initialData,
  provinces,
}: EditProfileFormProps) {
  const userAuth = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const updateUserProfile = useUpdateUserProfile(userAuth!.username);

  const avatarUpload = useMediaUpload({
    maxFiles: 1,
    maxSizeMB: 10,
    initialMedia: initialData.avatar
      ? [{ url: initialData.avatar.url, mediaType: MediaType.IMAGE }]
      : [],
  });

  const coverUpload = useMediaUpload({
    maxFiles: 1,
    maxSizeMB: 20,
    initialMedia: initialData.coverPhoto
      ? [{ url: initialData.coverPhoto.url, mediaType: MediaType.IMAGE }]
      : [],
  });

  const currentAvatar = avatarUpload.media[0];
  const currentCover = coverUpload.media[0];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: initialData.bio || '',
      work: initialData.work || '',
      location: initialData.currentLocation || '',
      provinceCode: initialData.province
        ? Number(initialData.province.code)
        : null,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    let avatarPayload: string | null | undefined = undefined;
    let coverPayload: string | null | undefined = undefined;

    if (currentAvatar && currentAvatar.id) {
      avatarPayload = currentAvatar.id;
    } else if (!currentAvatar && initialData.avatar) {
      avatarPayload = null;
    }

    if (currentCover && currentCover.id) {
      coverPayload = currentCover.id;
    } else if (!currentCover && initialData.coverPhoto) {
      coverPayload = null;
    }

    const payload = {
      bio: data.bio,
      work: data.work,
      currentLocation: data.location,
      provinceCode:
        data.provinceCode != undefined
          ? data.provinceCode !== null
            ? data.provinceCode.toString()
            : ''
          : undefined,
      avatar: avatarPayload,
      coverPhoto: coverPayload,
    };

    try {
      const res = await updateUserProfile.mutateAsync(payload);
      setUser({ ...userAuth, ...res } as StoreUser);
      toast.success('Cập nhật thành công');
    } catch (e) {
      console.error(e);
      toast.error('Cập nhật thất bại');
    }
  };

  const isPending = updateUserProfile.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AvatarCard currentAvatar={currentAvatar} avatarUpload={avatarUpload} />
        <CoverPhotoCard currentCover={currentCover} coverUpload={coverUpload} />

        <BioCard
          control={form.control}
          provinces={provinces}
          isLoadingProvinces={!provinces.length}
        />

        <Card>
          <CardFooter className="pt-6 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
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
    </Form>
  );
}

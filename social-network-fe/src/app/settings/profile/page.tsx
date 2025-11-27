'use client';

import { useStore } from '@/store';
import { useUserProfile } from '@/features/user/hooks/useUser';
import { EditProfileSkeleton } from '@/features/user/components/settings/profile-settings/ProfileSettingsSkeleton';
import { useGetProvinces } from '@/features/province/hooks/useGetProvinces';
import { EditProfileForm } from '@/features/user/components/settings/profile-settings/form/EditProfileForm';

export default function EditProfilePage() {
  const userAuth = useStore((s) => s.user);
  const { data: user, isLoading: isLoadingProfile } = useUserProfile(
    userAuth!.username
  );
  const { data: provinces } = useGetProvinces();

  if (isLoadingProfile || !user) {
    return <EditProfileSkeleton />;
  }
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Chỉnh sửa trang cá nhân</h1>
      </header>

      <EditProfileForm initialData={user} provinces={provinces || []} />
    </div>
  );
}


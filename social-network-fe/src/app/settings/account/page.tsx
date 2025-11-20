'use client';
import AccountSettingsForm from '@/components/features/settings/account-settings/AccountSettingsForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAccount } from '@/hooks/user/useUser';

export default function AccountSettingsPage() {
  const { data: userAccount, isLoading } = useGetAccount();

  if (isLoading || !userAccount) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="pb-2 border-b space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="pb-2 border-b">
        <h1 className="text-3xl font-bold tracking-tight">
          Thông tin tài khoản
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin cá nhân và cài đặt bảo mật riêng tư.
        </p>
      </div>

      <AccountSettingsForm initialData={userAccount} key={userAccount.id} />
    </div>
  );
}

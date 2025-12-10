'use client';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import UserProfileFeed from '@/features/user/components/common/UserFeed';
import UserSidebar from '@/features/user/components/common/UserSidebar';
import { useUserProfile } from '@/features/user/hooks/useUser';
import { useStore } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';
import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';
import { ViewAsTypeFriendshipStatus } from '@/features/user/components/profile/header/ProfileActions';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: user, isLoading: isLoadingUser } = useUserProfile(username);
  const userAuth = useStore((s) => s.user);

  const viewAsType = useMemo((): ViewAsTypeFriendshipStatus => {
    if (!user) return 'PUBLIC_LOGGED_OUT';

    const isLoggedIn = !!userAuth;
    const isOwner = userAuth?.username === user.username;
    if (isOwner) return 'OWNER';
    if (user.userProfileType === FriendshipStatus.BLOCKED) return 'BLOCKED';
    if (user.userProfileType === FriendshipStatus.ACCEPTED) return 'FRIEND';
    if (user.userProfileType === FriendshipStatus.PENDING) {
      return 'FRIEND_REQUEST_SENT';
    }
    if (isLoggedIn) return 'PUBLIC_LOGGED_IN';
    return 'PUBLIC_LOGGED_OUT';
  }, [user, userAuth]);

  if (isLoadingUser) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 md:sticky top-4 self-start space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </aside>
        <section className="md:col-span-2 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </section>
      </div>
    );
  }

  if (!user) {
    return <div>Không tìm thấy người dùng</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <aside className="md:col-span-1 md:sticky top-4 self-start space-y-6">
        <UserSidebar user={user} viewAsType={viewAsType} />
      </aside>

      <section className="md:col-span-2 space-y-6">
        <UserProfileFeed username={username} isOwner={viewAsType === 'OWNER'} />
      </section>
    </div>
  );
}

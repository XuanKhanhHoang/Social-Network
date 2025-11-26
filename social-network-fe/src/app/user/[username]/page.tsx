'use client';
import { useParams } from 'next/navigation';
import UserProfileFeed from '@/components/features/user/common/UserFeed';
import { useUserProfile } from '@/hooks/user/useUser';
import { useStore } from '@/store';
import { Skeleton } from '@/components/ui/skeleton';

type FriendshipStatus =
  | 'self'
  | 'friends'
  | 'pending_outgoing'
  | 'pending_incoming'
  | 'not_friends';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: user, isLoading: isLoadingUser } = useUserProfile(username);
  const userAuth = useStore((s) => s.user);

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

  const isLoggedIn = !!userAuth;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <aside className="md:col-span-1 md:sticky top-4 self-start space-y-6">
        {/* <UserSidebar user={user} isLoggedIn={isLoggedIn} /> */}
      </aside>

      <section className="md:col-span-2 space-y-6">
        <UserProfileFeed username={username} />
      </section>
    </div>
  );
}

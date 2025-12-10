'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useUserFriendsPreview } from '@/features/user/hooks/useUser';
import { transformToUserSummary } from '@/features/user/types';
import { AlertCircle, UserX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import FriendCard from '@/features/friendship/components/cards/FriendCard';

export default function FriendsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data, isLoading, isError, refetch } = useUserFriendsPreview(username);

  if (isLoading) return <FriendsListSkeleton />;

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              Không thể tải danh sách bạn bè.
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const total = data?.pages[0].total ?? 0;
  const friends =
    data?.pages
      .flatMap((page) => page.data)
      .map((r) => transformToUserSummary(r)) ?? [];

  if (friends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tất cả bạn bè</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <UserX className="h-12 w-12 mb-4 opacity-50" />
          <p>Người dùng này chưa có bạn bè nào.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả bạn bè ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              user={friend}
              actions={
                <Button variant="outline" size="sm" className="w-full">
                  Hủy bạn
                </Button>
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FriendsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center p-4 gap-4 border rounded-lg bg-card text-card-foreground shadow-sm"
            >
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

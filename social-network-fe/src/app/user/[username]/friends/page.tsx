'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useUserFriendsPreview } from '@/hooks/user/useUser';
import { transformToUserSummary } from '@/lib/interfaces/user';
import { SkeletonUserPhotos } from '@/components/features/media/user/skeleton-photos-preview';

export default function FriendsPage() {
  const params = useParams();
  const username = params.username as string;
  const { data, isLoading, isError } = useUserFriendsPreview(username);
  const total = data?.pages[0].total ?? 0;
  const friends =
    data?.pages
      .flatMap((page) => page.data)
      .map((r) => transformToUserSummary(r)) ?? [];
  if (isLoading) return <SkeletonUserPhotos />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả bạn bè ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <Card key={friend.id} className="flex items-center p-4 gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={friend.avatar} />
                <AvatarFallback>{friend.firstName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <span className="font-semibold text-lg">{friend.fullName}</span>
                <p className="text-sm text-muted-foreground">{0} bạn chung</p>
              </div>
              <Button variant="secondary" size="sm">
                Hủy bạn
              </Button>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

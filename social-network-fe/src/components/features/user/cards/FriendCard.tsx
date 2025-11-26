'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserSummary } from '@/lib/interfaces/user';
import Link from 'next/link';

interface FriendsCardProps {
  friends: UserSummary[];
  friendCount: number;
  username: string;
}

export function FriendsCard({
  friends,
  friendCount,
  username,
}: FriendsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Bạn bè</CardTitle>
        <Link href={`/user/${username}/friends`} passHref>
          <Button variant="link" className="p-0 h-auto text-blue-500">
            Xem tất cả
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {friendCount} người bạn
        </p>
        <div className="grid grid-cols-3 gap-3">
          {friends.length > 0 &&
            friends.map((friend) => (
              <Link
                href={`/username/${friend.username}`}
                key={friend.id}
                className="flex flex-col items-center group"
              >
                <UserAvatar
                  name={friend.firstName}
                  src={friend.avatar?.url}
                  className="w-16 h-16 mb-1"
                  size={128}
                />
                <span className="text-xs font-medium text-center truncate w-full group-hover:underline">
                  {friend.lastName + ' ' + friend.firstName}
                </span>
              </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

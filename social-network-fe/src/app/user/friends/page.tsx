'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Giả lập fetch data bạn bè (bạn sẽ dùng SWR/TanStack Query ở đây)
const friendsList = Array.from({ length: 12 }).map((_, i) => ({
  id: `f${i}`,
  name: `Tên Bạn ${i}`,
  mutualFriends: Math.floor(Math.random() * 20) + 1,
  avatarUrl: `https://picsum.photos/80/80?random=${i + 30}`,
}));

export default function FriendsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả bạn bè (204)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendsList.map((friend) => (
            <Card key={friend.id} className="flex items-center p-4 gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={friend.avatarUrl} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <span className="font-semibold text-lg">{friend.name}</span>
                <p className="text-sm text-muted-foreground">
                  {friend.mutualFriends} bạn chung
                </p>
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

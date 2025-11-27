import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserSummary } from '@/lib/interfaces';
import Link from 'next/link';

interface FriendCardProps {
  user: UserSummary;
  actions?: React.ReactNode;
}

export default function FriendCard({ user, actions }: FriendCardProps) {
  return (
    <Card className="p-4 rounded-md">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 items-center">
          <Link href={`/user/${user?.username}`}>
            <UserAvatar
              src={user?.avatar?.url}
              name={user?.firstName}
              size={64}
              className="h-16 w-16 rounded-full"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              @{user?.username}
            </p>
          </div>
        </div>
        {actions && <div className="flex gap-2 w-full">{actions}</div>}
      </div>
    </Card>
  );
}

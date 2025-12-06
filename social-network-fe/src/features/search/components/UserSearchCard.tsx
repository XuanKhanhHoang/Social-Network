import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import { SearchUserDto } from '../types';
import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useSendFriendRequest,
  useUnfriend,
} from '@/features/friendship/hooks/useFriendship';

interface UserSearchCardProps {
  user: SearchUserDto;
}

export function UserSearchCard({ user }: UserSearchCardProps) {
  const { friendshipStatus, isRequester } = user;

  const { mutate: sendRequest, isPending: isSending } = useSendFriendRequest();
  const { mutate: cancelRequest, isPending: isCanceling } =
    useCancelFriendRequest();
  const { mutate: acceptRequest, isPending: isAccepting } =
    useAcceptFriendRequest();
  const { mutate: unfriend, isPending: isUnfriending } = useUnfriend();

  const isLoading = isSending || isCanceling || isAccepting || isUnfriending;

  const handleAction = () => {
    if (friendshipStatus === FriendshipStatus.ACCEPTED) {
      if (confirm('Bạn có chắc chắn muốn hủy kết bạn?')) {
        unfriend(user._id);
      }
    } else if (friendshipStatus === FriendshipStatus.PENDING) {
      if (isRequester) {
        cancelRequest(user._id);
      } else {
        acceptRequest({ requesterId: user._id });
      }
    } else {
      sendRequest({ recipientId: user._id });
    }
  };

  let buttonText = 'Thêm bạn';
  let buttonVariant:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive' = 'default';
  let buttonClass = '';

  if (friendshipStatus === FriendshipStatus.ACCEPTED) {
    buttonText = 'Bạn bè';
    buttonVariant = 'secondary';
    buttonClass = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  } else if (friendshipStatus === FriendshipStatus.PENDING) {
    if (isRequester) {
      buttonText = 'Hủy lời mời';
      buttonVariant = 'secondary';
      buttonClass = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    } else {
      buttonText = 'Chấp nhận';
      buttonVariant = 'default';
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <Link href={`/user/${user.username}`}>
          <UserAvatar
            src={user.avatar}
            name={user.username}
            className="h-12 w-12"
          />
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/user/${user.username}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {user.lastName} {user.firstName}
          </Link>
          <span className="text-sm text-gray-500">@{user.username}</span>
        </div>
      </div>

      <Button
        variant={buttonVariant}
        size="sm"
        className={`px-4 ${buttonClass}`}
        onClick={handleAction}
        disabled={isLoading}
      >
        {isLoading ? 'Đang xử lý...' : buttonText}
      </Button>
    </div>
  );
}

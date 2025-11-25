'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDenyFriendRequest,
  useSendFriendRequest,
  useUnfriend,
} from '@/hooks/friendship/useFriendship';
import {
  Edit3,
  Plus,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

export type ViewAsTypeFriendshipStatus =
  | 'OWNER'
  | 'FRIEND'
  | 'PUBLIC_LOGGED_IN'
  | 'PUBLIC_LOGGED_OUT'
  | 'FRIEND_REQUEST_SENT'
  | 'FRIEND_REQUEST_RECEIVED';

interface ProfileActionsProps {
  viewAsType: ViewAsTypeFriendshipStatus;
  userId: string;
}

export function ProfileActions({ viewAsType, userId }: ProfileActionsProps) {
  const sendFriendRequest = useSendFriendRequest();
  const acceptFriendRequest = useAcceptFriendRequest();
  const denyFriendRequest = useDenyFriendRequest();
  const cancelFriendRequest = useCancelFriendRequest();
  const unfriend = useUnfriend();

  if (viewAsType === 'OWNER') {
    return (
      <>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm vào tin
        </Button>
        <Button variant="outline" asChild>
          <Link href="/settings/profile">
            <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa trang
          </Link>
        </Button>
      </>
    );
  }

  if (viewAsType === 'FRIEND') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Bạn bè
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => unfriend.mutate(userId)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Hủy kết bạn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button>
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'FRIEND_REQUEST_SENT') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Đã gửi lời mời
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => cancelFriendRequest.mutate(userId)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Hủy lời mời
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  if (viewAsType === 'FRIEND_REQUEST_RECEIVED') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Phản hồi lời mời
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                acceptFriendRequest.mutate({
                  requesterId: userId,
                })
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Chấp nhận
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => denyFriendRequest.mutate(userId)}
            >
              <UserX className="mr-2 h-4 w-4" />
              Từ chối
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_IN') {
    return (
      <>
        <Button
          onClick={() => sendFriendRequest.mutate({ recipientId: userId })}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Thêm bạn bè
        </Button>
        <Button variant="outline">
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_OUT') {
    return (
      <Link href="/login" passHref>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Đăng nhập để thêm bạn
        </Button>
      </Link>
    );
  }

  return null;
}

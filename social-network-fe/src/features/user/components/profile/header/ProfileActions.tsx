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
  useBlockUser,
  useUnblockUser,
} from '@/features/friendship/hooks/useFriendship';
import { useChatContext } from '@/features/chat/context/ChatContext';
import {
  Edit3,
  Plus,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  ChevronDown,
  Ban,
} from 'lucide-react';
import Link from 'next/link';

export type ViewAsTypeFriendshipStatus =
  | 'OWNER'
  | 'FRIEND'
  | 'PUBLIC_LOGGED_IN'
  | 'PUBLIC_LOGGED_OUT'
  | 'FRIEND_REQUEST_SENT'
  | 'FRIEND_REQUEST_RECEIVED'
  | 'BLOCKED';

export interface ProfileUserInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface ProfileActionsProps {
  viewAsType: ViewAsTypeFriendshipStatus;
  userId: string;
  userInfo?: ProfileUserInfo;
}

export function ProfileActions({
  viewAsType,
  userId,
  userInfo,
}: ProfileActionsProps) {
  const { openSession } = useChatContext();

  const handleOpenChat = () => {
    if (!userInfo) return;
    openSession({
      type: 'private',
      data: {
        _id: userInfo.id,
        username: userInfo.username,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        avatar: userInfo.avatar ? { url: userInfo.avatar } : undefined,
      },
    });
  };

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const handleBlock = () => {
    if (!userInfo) return;
    blockUser.mutate({ targetUserId: userId, username: userInfo.username });
  };

  const handleUnblock = () => {
    if (!userInfo) return;
    unblockUser.mutate({ targetUserId: userId, username: userInfo.username });
  };

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

  if (viewAsType === 'BLOCKED') {
    return (
      <Button
        variant="outline"
        onClick={handleUnblock}
        disabled={unblockUser.isPending}
      >
        <Ban className="mr-2 h-4 w-4" />
        {unblockUser.isPending ? 'Đang xử lý...' : 'Hủy chặn'}
      </Button>
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

        <Button onClick={handleOpenChat}>
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
        <Button
          variant="outline"
          onClick={handleBlock}
          disabled={blockUser.isPending}
        >
          <Ban className="mr-2 h-4 w-4" />
          {blockUser.isPending ? 'Đang xử lý...' : 'Chặn'}
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

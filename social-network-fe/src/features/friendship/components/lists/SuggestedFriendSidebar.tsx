'use client';

import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';
import {
  useSendFriendRequest,
  useSuggestedFriends,
} from '@/features/friendship/hooks/useFriendship';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export const SuggestedFriendSidebar = () => {
  const { data, isLoading } = useSuggestedFriends(9);
  const sendRequest = useSendFriendRequest();

  const handleAddFriend = (userId: string) => {
    sendRequest.mutate({ recipientId: userId });
  };

  if (isLoading) {
    return (
      <div className="shadow-sm rounded-md p-3 h-1/2 flex flex-col overflow-hidden justify-center items-center">
        <div className="text-sm text-gray-500">Đang tải...</div>
      </div>
    );
  }

  const users = data?.pages.flatMap((page) => page.data) || [];

  if (users.length === 0) {
    return (
      <div className="shadow-sm rounded-md p-3 h-1/2 flex flex-col overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          👥 Gợi ý bạn bè
        </h3>
        <div className="flex-1 flex items-center justify-center text-xs text-gray-500">
          Không có gợi ý nào
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-sm rounded-md p-3 h-1/2 flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        👥 Gợi ý bạn bè
      </h3>

      <div className="flex-1 overflow-y-auto pr-1">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between py-2"
          >
            <Link
              href={`/user/${user.username}`}
              className="flex items-center flex-1 min-w-0 mr-2 group"
            >
              <UserAvatar
                src={user.avatar?.url}
                name={user.firstName}
                className="w-9 h-9 flex-shrink-0 mr-3"
                size={36}
              />
              <div className="flex flex-col overflow-hidden">
                <div className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  @{user.username}
                </div>
              </div>
            </Link>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-400 h-7 px-3 text-xs flex items-center flex-shrink-0"
              onClick={() => handleAddFriend(user._id)}
              disabled={sendRequest.isPending}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Kết bạn
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-auto text-right z-20 pt-2 border-t border-gray-100">
        <Link
          href="/friends"
          className="text-xs text-blue-500 font-semibold transition-colors hover:underline"
        >
          Xem thêm
        </Link>
      </div>
    </div>
  );
};

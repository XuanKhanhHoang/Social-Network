'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuggestedMessagingUsers } from '../hooks/useChat';
import { UserAvatar } from '@/components/ui/user-avatar';

export const SuggestedMessagingList = () => {
  const { data, isFetchingNextPage, isLoading } = useSuggestedMessagingUsers({
    limit: 12,
  });

  const users = data || [];

  if (isLoading) {
    return (
      <ScrollArea className="flex-1 min-h-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-2">
            <Skeleton className="w-10 h-10 rounded-full mr-3" />
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      {users.map((user, index) => (
        <div
          key={user.id}
          className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="relative flex-shrink-0 mr-3">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              className="w-10 h-10"
            />
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="text-sm font-medium text-gray-800 truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </div>
          </div>
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="p-2 text-center text-xs text-gray-500">Loading...</div>
      )}
    </ScrollArea>
  );
};

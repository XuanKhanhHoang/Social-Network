import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { FriendshipService } from '../services/friendship.service';
import { friendshipKeys } from './friendshipKeys';
import { FriendshipDto } from '@/features/friendship/services/friendship.dto';
import { mapFriendshipDtoToDomain } from '../types';

export function useFriendRequests() {
  return useQuery({
    queryKey: friendshipKeys.received(),
    queryFn: () => FriendshipService.getReceivedFriendRequests({ limit: 10 }),
    select: (data) => ({
      ...data,
      data: data.data.map((item: FriendshipDto) =>
        mapFriendshipDtoToDomain(item)
      ),
    }),
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: friendshipKeys.sent(),
    queryFn: () => FriendshipService.getSentFriendRequests({ limit: 10 }),
    select: (data) => ({
      ...data,
      data: data.data.map((item: FriendshipDto) =>
        mapFriendshipDtoToDomain(item)
      ),
    }),
  });
}

export function useSuggestedFriends(limit?: number) {
  return useInfiniteQuery({
    queryKey: friendshipKeys.suggested(),
    queryFn: ({ pageParam }) =>
      FriendshipService.getSuggestedFriends({
        limit: limit || 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.nextCursor : undefined,
    placeholderData: (previousData) => previousData,
  });
}

export function useFriends(username?: string, search?: string) {
  return useInfiniteQuery({
    queryKey: friendshipKeys.friendList(username, search),
    queryFn: ({ pageParam }) =>
      FriendshipService.getFriends({
        username: username!,
        limit: 20,
        cursor: pageParam,
        search,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.nextCursor : undefined,
    enabled: !!username,
    placeholderData: (previousData) => previousData,
    gcTime: search ? 0 : 5 * 60 * 1000,
  });
}

export function useBlockedUsers() {
  return useInfiniteQuery({
    queryKey: friendshipKeys.blocked(),
    queryFn: ({ pageParam }) =>
      FriendshipService.getBlockedUsers({
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? lastPage.pagination.nextCursor : undefined,
  });
}

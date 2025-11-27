import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { FriendshipService } from '../services/friendship.service';
import { friendshipKeys } from './friendshipKeys';
import {
  AcceptFriendRequestDto,
  SendFriendRequestDto,
} from '@/lib/dtos/friendship';
import { userKeys } from '@/features/user/hooks/useUser';
import { mapFriendshipDtoToDomain } from '../types';

const updateHeaderAndProfileRecipientAndRequester = (
  queryClient: QueryClient,
  recipientUsername: string,
  requesterUsername: string
) => {
  queryClient.invalidateQueries({
    queryKey: userKeys.friend(recipientUsername),
  });

  queryClient.invalidateQueries({
    queryKey: userKeys.friend(requesterUsername),
  });
  queryClient.invalidateQueries({
    queryKey: userKeys.header(recipientUsername),
  });
  queryClient.invalidateQueries({
    queryKey: userKeys.header(requesterUsername),
  });
  queryClient.invalidateQueries({
    queryKey: userKeys.profile(recipientUsername),
  });
  queryClient.invalidateQueries({
    queryKey: userKeys.profile(requesterUsername),
  });
};

export function useFriendRequests() {
  return useQuery({
    queryKey: friendshipKeys.received(),
    queryFn: () => FriendshipService.getReceivedFriendRequests({ limit: 10 }),
    select: (data) => ({
      ...data,
      data: data.data.map((item) => mapFriendshipDtoToDomain(item)),
    }),
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: friendshipKeys.sent(),
    queryFn: () => FriendshipService.getSentFriendRequests({ limit: 10 }),
    select: (data) => ({
      ...data,
      data: data.data.map((item) => mapFriendshipDtoToDomain(item)),
    }),
  });
}

export function useSuggestedFriends() {
  return useInfiniteQuery({
    queryKey: friendshipKeys.suggested(),
    queryFn: ({ pageParam }) =>
      FriendshipService.getSuggestedFriends({
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined,
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
      lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined,
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
      lastPage.pagination.hasMore && lastPage.pagination.nextCursor
        ? lastPage.pagination.nextCursor
        : undefined,
  });
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptFriendRequestDto) => {
      return FriendshipService.acceptFriendRequest(data);
    },
    onSuccess: (r) => {
      toast.success('Đã chấp nhận lời mời kết bạn');
      queryClient.invalidateQueries({ queryKey: friendshipKeys.received() });
      queryClient.invalidateQueries({ queryKey: friendshipKeys.friends() });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.suggested(),
      });
      updateHeaderAndProfileRecipientAndRequester(
        queryClient,
        r.recipient.username,
        r.requester.username
      );
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
}
export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return FriendshipService.removeFriend(targetUserId);
    },
    onSuccess: (r) => {
      toast.success('Đã hủy kết bạn');
      queryClient.invalidateQueries({ queryKey: friendshipKeys.friends() });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.suggested(),
      });
      updateHeaderAndProfileRecipientAndRequester(
        queryClient,
        r.recipient.username,
        r.requester.username
      );
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return FriendshipService.cancelFriendRequest(targetUserId);
    },
    onSuccess: (r) => {
      toast.success(`Đã hủy lời mời kết bạn ${r.recipient.username}`);
      queryClient.invalidateQueries({ queryKey: friendshipKeys.sent() });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.suggested(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.header(r.recipient.username),
      });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
}
export function useDenyFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return FriendshipService.denyFriendRequest(targetUserId);
    },
    onSuccess: (r) => {
      toast.success(`Đã từ chối lời mời kết bạn ${r.recipient.username}`);
      queryClient.invalidateQueries({ queryKey: friendshipKeys.received() });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.suggested(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.header(r.recipient.username),
      });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendFriendRequestDto) => {
      return FriendshipService.sendFriendRequest(data);
    },
    onSuccess: (r) => {
      toast.success(`Đã gửi lời mời kết bạn ${r.recipient.username}`);
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.suggested(),
      });

      queryClient.invalidateQueries({ queryKey: friendshipKeys.sent() });
      queryClient.invalidateQueries({
        queryKey: userKeys.header(r.recipient.username),
      });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra');
    },
  });
}

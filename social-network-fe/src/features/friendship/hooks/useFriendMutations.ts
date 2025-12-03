import {
  useMutation,
  useQueryClient,
  QueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { FriendshipService } from '../services/friendship.service';
import { friendshipKeys } from './friendshipKeys';
import {
  AcceptFriendRequestDto,
  SendFriendRequestDto,
} from '@/features/friendship/services/friendship.dto';
import { userKeys } from '@/features/user/hooks/useUser';
import { FriendshipStatus } from '@/lib/constants/enums/friendship-status';
import { SearchUserResponseDto, SearchUserDto } from '@/features/search/types';

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

const updateSearchCache = (
  queryClient: QueryClient,
  targetUserId: string,
  updateFn: (user: SearchUserDto) => SearchUserDto
) => {
  queryClient.setQueriesData<InfiniteData<SearchUserResponseDto>>(
    { queryKey: ['search', 'users'] },
    (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((user) => {
            if (user._id === targetUserId) {
              return updateFn(user);
            }
            return user;
          }),
        })),
      };
    }
  );
};

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptFriendRequestDto) => {
      return FriendshipService.acceptFriendRequest(data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['search', 'users'] });
      const previousSearchData = queryClient.getQueriesData({
        queryKey: ['search', 'users'],
      });

      updateSearchCache(queryClient, newData.requesterId, (user) => ({
        ...user,
        friendshipStatus: FriendshipStatus.ACCEPTED,
        isRequester: false,
      }));

      return { previousSearchData };
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
    onError: (err, newTodo, context) => {
      if (context?.previousSearchData) {
        context.previousSearchData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Có lỗi xảy ra');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return FriendshipService.removeFriend(targetUserId);
    },
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ['search', 'users'] });
      const previousSearchData = queryClient.getQueriesData({
        queryKey: ['search', 'users'],
      });

      updateSearchCache(queryClient, targetUserId, (user) => ({
        ...user,
        friendshipStatus: 'NONE',
        isRequester: false,
      }));

      return { previousSearchData };
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
    onError: (err, newTodo, context) => {
      if (context?.previousSearchData) {
        context.previousSearchData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Có lỗi xảy ra');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
    },
  });
}

export function useCancelFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      return FriendshipService.cancelFriendRequest(targetUserId);
    },
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ['search', 'users'] });
      const previousSearchData = queryClient.getQueriesData({
        queryKey: ['search', 'users'],
      });

      updateSearchCache(queryClient, targetUserId, (user) => ({
        ...user,
        friendshipStatus: 'NONE',
        isRequester: false,
      }));

      return { previousSearchData };
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
    onError: (err, newTodo, context) => {
      if (context?.previousSearchData) {
        context.previousSearchData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Có lỗi xảy ra');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
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
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
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
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['search', 'users'] });
      const previousSearchData = queryClient.getQueriesData({
        queryKey: ['search', 'users'],
      });

      updateSearchCache(queryClient, newData.recipientId, (user) => ({
        ...user,
        friendshipStatus: FriendshipStatus.PENDING,
        isRequester: true,
      }));

      return { previousSearchData };
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
    onError: (err, newTodo, context) => {
      if (context?.previousSearchData) {
        context.previousSearchData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Có lỗi xảy ra');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['search', 'users'] });
    },
  });
}

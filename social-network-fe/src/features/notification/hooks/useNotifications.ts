import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { useStore } from '@/store';
import { mapNotificationDtoToDomain } from '../utils/mapper';
import { GetNotificationsResponseDto } from '../services/notification.dto';

const notificationsKeys = {
  all: ['notifications'] as const,
};
export const useNotificationsQuery = () => {
  return useInfiniteQuery({
    queryKey: notificationsKeys.all,
    queryFn: ({ pageParam }) =>
      notificationService.getNotifications(pageParam as string | undefined),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextCursor ?? undefined;
    },
    initialPageParam: undefined as string | undefined,
    select: (data) => ({
      pages: data.pages.map((page) => ({
        ...page,
        data: page.data.map(mapNotificationDtoToDomain),
      })),
      pageParams: data.pageParams,
    }),
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  const unreadCount = useStore((state) => state.unreadCount);
  const setUnreadCount = useStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData<
        InfiniteData<GetNotificationsResponseDto>
      >(['notifications']);

      queryClient.setQueryData<InfiniteData<GetNotificationsResponseDto>>(
        ['notifications'],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((notification) => {
                if (notification._id === notificationId) {
                  return { ...notification, isRead: true };
                }
                return notification;
              }),
            })),
          };
        }
      );

      let wasUnread = false;
      previousNotifications?.pages.forEach((page) => {
        const found = page.data.find((n) => n._id === notificationId);
        if (found && !found.isRead) {
          wasUnread = true;
        }
      });

      if (wasUnread) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }

      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        ['notifications'],
        context?.previousNotifications
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  const markAllReadStore = useStore((state) => state.markAllRead);

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      const previousNotifications = queryClient.getQueryData<
        InfiniteData<GetNotificationsResponseDto>
      >(['notifications']);

      queryClient.setQueryData<InfiniteData<GetNotificationsResponseDto>>(
        ['notifications'],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((notification) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        }
      );

      markAllReadStore();

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['notifications'],
        context?.previousNotifications
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

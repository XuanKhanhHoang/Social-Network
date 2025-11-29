import { useStore } from '@/store';
import { useNotificationsQuery } from './useNotifications';
import { useEffect, useMemo } from 'react';

export const useNotificationSync = () => {
  const realtimeNotification = useStore((state) => state.realtimeNotifications);
  const emptyRealtimeNotifications = useStore(
    (state) => state.emptyRealtimeNotifications
  );

  const query = useNotificationsQuery();

  useEffect(() => emptyRealtimeNotifications, [emptyRealtimeNotifications]);

  const mergedData = useMemo(() => {
    const serverData = query.data?.pages.flatMap((page) => page.data) || [];

    if (!realtimeNotification.length) return serverData;

    const serverIds = new Set(serverData.map((n) => n.id));
    const uniqueRealtime = realtimeNotification.filter(
      (n) => !serverIds.has(n.id)
    );

    return uniqueRealtime.length
      ? [...uniqueRealtime, ...serverData]
      : serverData;
  }, [query.data, realtimeNotification]);

  return {
    data: mergedData,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

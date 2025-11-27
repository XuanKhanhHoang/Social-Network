'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { ApiClient } from '@/services/api';

export const NotificationManager = () => {
  const setUnreadCount = useStore((state) => state.setUnreadCount);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { count } = await ApiClient.get<{ count: number }>(
          '/notifications/unread'
        );
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread notifications count:', error);
      }
    };

    fetchUnreadCount();
  }, [setUnreadCount]);

  return null;
};

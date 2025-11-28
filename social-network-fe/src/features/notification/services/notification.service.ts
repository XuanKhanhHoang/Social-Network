import { ApiClient } from '@/services/api';
import { GetNotificationsResponseDto } from './notification.dto';

export const notificationService = {
  getNotifications: async (
    cursor?: string,
    limit: number = 10
  ): Promise<GetNotificationsResponseDto> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
      params.append('cursor', cursor);
    }
    return await ApiClient.get<GetNotificationsResponseDto>(
      `/notifications?${params.toString()}`
    );
  },

  markAsRead: async (id: string) => {
    return ApiClient.patch<void>(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return ApiClient.patch<void>('/notifications/read-all');
  },
};

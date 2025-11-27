import { StateCreator } from 'zustand';
import { Notification } from '@/lib/types/notification';

export interface NotificationSlice {
  unreadCount: number;
  realtimeNotifications: Notification[];
  setUnreadCount: (count: number) => void;
  addNotification: (item: Notification) => void;
  markAllRead: () => void;
}

export const createNotificationSlice: StateCreator<NotificationSlice> = (
  set
) => ({
  unreadCount: 0,
  realtimeNotifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (item) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      realtimeNotifications: [item, ...state.realtimeNotifications],
    })),
  markAllRead: () => set({ unreadCount: 0, realtimeNotifications: [] }),
});

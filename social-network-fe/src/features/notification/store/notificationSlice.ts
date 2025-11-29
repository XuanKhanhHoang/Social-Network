import { StateCreator } from 'zustand';
import { Notification } from '../types';

export interface NotificationSlice {
  unreadCount: number;
  realtimeNotifications: Notification[];
  setUnreadCount: (count: number) => void;
  addNotification: (item: Notification) => void;
  markAllRead: () => void;
  emptyRealtimeNotifications: () => void;
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
  emptyRealtimeNotifications: () => set({ realtimeNotifications: [] }),
});

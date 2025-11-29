import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from '@/features/auth/store/authSlice';
import {
  NotificationSlice,
  createNotificationSlice,
} from '@/features/notification/store/notificationSlice';

type StoreState = AuthSlice & NotificationSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createNotificationSlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
        }),
      }
    )
  )
);
export const useAuth = () =>
  useStore((state) => ({
    user: state.user,
    setUser: state.setUser,
    clearUser: state.clearUser,
  }));

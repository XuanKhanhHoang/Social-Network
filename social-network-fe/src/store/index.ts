import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import {
  NotificationSlice,
  createNotificationSlice,
} from './slices/notificationSlice';

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

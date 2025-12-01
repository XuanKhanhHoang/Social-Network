import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from '@/features/auth/store/authSlice';
import {
  NotificationSlice,
  createNotificationSlice,
} from '@/features/notification/store/notificationSlice';
import {
  CryptoSlice,
  createCryptoSlice,
} from '@/features/crypto/store/cryptoSlice';

type StoreState = AuthSlice & NotificationSlice & CryptoSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createNotificationSlice(...a),
        ...createCryptoSlice(...a),
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

// src/store/index.ts - Root store
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
type StoreState = AuthSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
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

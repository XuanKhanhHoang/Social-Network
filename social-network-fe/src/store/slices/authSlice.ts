import { User } from '@/lib/dtos';
import { StateCreator } from 'zustand';

export interface AuthSlice {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

import { StateCreator } from 'zustand';

export interface StoreUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  username: string;
}
export function transformToStoreUser(
  user: unknown & {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    username: string;
  }
): StoreUser {
  return {
    id: user['_id'],
    firstName: user['firstName'],
    lastName: user['lastName'],
    email: user['email'],
    avatar: user['avatar'],
    username: user['username'],
  };
}
export interface AuthSlice {
  user: StoreUser | null;
  setUser: (user: StoreUser | null) => void;
  clearUser: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

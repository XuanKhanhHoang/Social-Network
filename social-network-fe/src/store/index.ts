// src/store/index.ts - Root store
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { createPostSlice, PostSlice } from './slices/postSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
type StoreState = AuthSlice & UISlice & PostSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createUISlice(...a),
        ...createPostSlice(...a),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          theme: state.theme,
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

export const useUI = () =>
  useStore((state) => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
    setTheme: state.setTheme,
  }));

export const usePostUI = () =>
  useStore((state) => ({
    selectedPostId: state.selectedPostId,
    setSelectedPostId: state.setSelectedPostId,
    isCreatePostModalOpen: state.isCreatePostModalOpen,
    openCreatePostModal: state.openCreatePostModal,
    closeCreatePostModal: state.closeCreatePostModal,
  }));

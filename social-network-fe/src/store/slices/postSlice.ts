import { StateCreator } from 'zustand';

export interface PostSlice {
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  isCreatePostModalOpen: boolean;
  openCreatePostModal: () => void;
  closeCreatePostModal: () => void;
}

export const createPostSlice: StateCreator<PostSlice> = (set) => ({
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),
  isCreatePostModalOpen: false,
  openCreatePostModal: () => set({ isCreatePostModalOpen: true }),
  closeCreatePostModal: () => set({ isCreatePostModalOpen: false }),
});

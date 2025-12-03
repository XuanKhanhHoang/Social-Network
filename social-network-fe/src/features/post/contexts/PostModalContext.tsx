'use client';
import { createContext, useContext, useState } from 'react';
import { PostInEditor } from '../components/create/text-editor/type';
import PostEditor from '../components/create/text-editor/Editor';
type PostModalContextType = {
  openCreate: () => void;
  openEdit: (post: PostInEditor) => void;
  close: () => void;
  isOpen: boolean;
};

const PostModalContext = createContext<PostModalContextType | null>(null);

export function PostModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingPost, setEditingPost] = useState<PostInEditor | undefined>(
    undefined
  );

  const openCreate = () => {
    setMode('create');
    setEditingPost(undefined);
    setIsOpen(true);
  };

  const openEdit = (post: PostInEditor) => {
    setMode('edit');
    setEditingPost(post);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingPost(undefined);
    setMode('create');
  };

  return (
    <PostModalContext.Provider
      value={{
        isOpen,
        openCreate,
        openEdit,
        close,
      }}
    >
      {children}
      {isOpen && (
        <PostEditor handleClose={close} mode={mode} post={editingPost} />
      )}
    </PostModalContext.Provider>
  );
}

export function usePostModalContext() {
  const ctx = useContext(PostModalContext);
  if (!ctx)
    throw new Error('usePostModalContext must be inside PostModalProvider');
  return ctx;
}

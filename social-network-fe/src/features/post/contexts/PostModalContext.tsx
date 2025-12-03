'use client';
import { createContext, useContext, useState } from 'react';
import { PostInEditor } from '../components/create/text-editor/type';
import PostEditor from '../components/create/text-editor/Editor';
import { Post } from '@/features/post/types/post';
type PostModalContextType = {
  openCreate: () => void;
  openEdit: (post: PostInEditor) => void;
  openShare: (post: Post) => void;
  close: () => void;
  isOpen: boolean;
};

const PostModalContext = createContext<PostModalContextType | null>(null);

export function PostModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'share'>('create');
  const [editingPost, setEditingPost] = useState<PostInEditor | undefined>(
    undefined
  );
  const [sharedPost, setSharedPost] = useState<Post | undefined>(undefined);

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

  const openShare = (post: Post) => {
    const targetPost = post.parentPost ? post.parentPost : post;
    setMode('share');
    setSharedPost(targetPost);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingPost(undefined);
    setSharedPost(undefined);
    setMode('create');
  };

  return (
    <PostModalContext.Provider
      value={{
        isOpen,
        openCreate,
        openEdit,
        openShare,
        close,
      }}
    >
      {children}
      {isOpen && (
        <PostEditor
          handleClose={close}
          mode={mode}
          post={editingPost}
          sharedPost={sharedPost}
        />
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

'use client';
import { createContext, useContext, useState } from 'react';

const CreatePostContext = createContext<{
  openCreate: () => void;
  closeCreate: () => void;
  isOpen: boolean;
} | null>(null);

export function CreatePostProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CreatePostContext.Provider
      value={{
        isOpen,
        openCreate: () => setIsOpen(true),
        closeCreate: () => setIsOpen(false),
      }}
    >
      {children}
    </CreatePostContext.Provider>
  );
}

export function useCreatePostContext() {
  const ctx = useContext(CreatePostContext);
  if (!ctx) throw new Error('useFeedContext must be inside FeedProvider');
  return ctx;
}

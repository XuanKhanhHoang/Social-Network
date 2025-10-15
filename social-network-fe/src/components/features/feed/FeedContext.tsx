'use client';
import { createContext, useContext, useState } from 'react';

const FeedContext = createContext<{
  openCreate: () => void;
  closeCreate: () => void;
  isOpen: boolean;
} | null>(null);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FeedContext.Provider
      value={{
        isOpen,
        openCreate: () => setIsOpen(true),
        closeCreate: () => setIsOpen(false),
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeedContext must be inside FeedProvider');
  return ctx;
}

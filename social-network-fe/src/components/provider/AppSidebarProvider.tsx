'use client';
import { createContext, useContext, useState } from 'react';

const AppSidebarContext = createContext<{
  expandSidebar: () => void;
  collapseSidebar: () => void;
  isExpanded: boolean;
} | null>(null);

export function AppSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AppSidebarContext.Provider
      value={{
        isExpanded,
        expandSidebar: () => setIsExpanded(true),
        collapseSidebar: () => setIsExpanded(false),
      }}
    >
      {children}
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebarContext() {
  const ctx = useContext(AppSidebarContext);
  if (!ctx)
    throw new Error('useAppSidebarContext must be inside AppSidebarProvider');
  return ctx;
}

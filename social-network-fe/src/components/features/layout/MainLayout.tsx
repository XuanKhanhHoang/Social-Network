'use client';

import { useStore } from '@/store';
import { AppSidebarProvider } from '@/components/provider/AppSidebarProvider';
import LeftSidebar from '@/components/features/layout/LeftSideBar';

interface MainLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
  isAuthenticated: boolean;
}

export function MainLayout({
  children,
  modal,
  isAuthenticated,
}: MainLayoutProps) {
  const user = useStore((s) => s.user);

  const showSidebar = isAuthenticated || !!user;

  if (showSidebar) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-screen mx-auto flex">
          <AppSidebarProvider>
            <LeftSidebar />
            {children}
            {modal}
          </AppSidebarProvider>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {modal}
    </>
  );
}

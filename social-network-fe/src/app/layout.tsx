import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/services/auth';
import { AppInitializer } from '@/components/features/layout/AppInitializer';
import LeftSidebar from '@/components/features/layout/LeftSideBar';
import { CreatePostProvider } from '@/components/features/feed/FeedContext';
import { UserSummaryWithEmailDto } from '@/lib/dtos';
import { transformToStoreUser } from '@/store/slices/authSlice';
import { ImageViewerProvider } from '@/components/provider/ImageViewerProvider';
import { AppSidebarProvider } from '@/components/provider/AppSidebarProvider';
import { AuthGuard } from '@/components/features/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'Vibe',
  description: 'Vibe - Make your vibe',
};

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  let user: UserSummaryWithEmailDto | undefined;
  const headersList = await headers();
  const isPublic = headersList.get('x-route-public') === 'true';
  const isSemiPublic = headersList.get('x-route-semi-public') === 'true';

  if (typeof window == 'undefined') {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (accessToken || refreshToken) {
      try {
        user = await authService.verifyUser({
          headers: {
            Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
          },
        });
      } catch (error) {
        console.error('Verify user failed in Layout:', error);
        user = undefined;
      }
    }
  }

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppInitializer>
          <AuthGuard
            initialUser={user && transformToStoreUser(user)}
            isPublic={isPublic}
            isSemiPublic={isSemiPublic}
          >
            <QueryProvider>
              <EmojiPickerProvider>
                <ImageViewerProvider>
                  <CreatePostProvider>
                    {user != undefined ? (
                      <div className="min-h-screen bg-white">
                        <div className="max-w-screen mx-auto flex">
                          <AppSidebarProvider>
                            <LeftSidebar />
                            {children}
                            {modal}
                          </AppSidebarProvider>
                        </div>
                      </div>
                    ) : (
                      <>
                        {children}
                        {modal}
                      </>
                    )}
                  </CreatePostProvider>
                </ImageViewerProvider>
              </EmojiPickerProvider>
              <Toaster position="top-right" expand />
            </QueryProvider>
          </AuthGuard>
        </AppInitializer>
      </body>
    </html>
  );
}

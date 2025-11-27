import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/services/auth';
import { AppInitializer } from '@/components/features/layout/AppInitializer';
import { CreatePostProvider } from '@/components/features/feed/FeedContext';
import { ImageViewerProvider } from '@/components/provider/ImageViewerProvider';
import { AuthGuard } from '@/components/features/auth/AuthGuard';
import { MainLayout } from '@/components/features/layout/MainLayout';

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
  let isAuthenticated = false;
  const headersList = await headers();
  const isPublic = headersList.get('x-route-public') === 'true';
  const isSemiPublic = headersList.get('x-route-semi-public') === 'true';

  if (typeof window == 'undefined') {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (accessToken) {
      try {
        await authService.checkSession({
          headers: {
            Cookie: `accessToken=${accessToken};`,
          },
        });
        isAuthenticated = true;
      } catch {
        isAuthenticated = false;
      }
    }
  }

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppInitializer>
          <AuthGuard
            hasToken={isAuthenticated}
            isPublic={isPublic}
            isSemiPublic={isSemiPublic}
          >
            <QueryProvider>
              <EmojiPickerProvider>
                <ImageViewerProvider>
                  <CreatePostProvider>
                    <MainLayout isAuthenticated={isAuthenticated} modal={modal}>
                      {children}
                    </MainLayout>
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

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/features/auth/services/auth.service';
import { AppInitializer } from '@/components/layout/AppInitializer';
import { CreatePostProvider } from '@/features/post/components/feed/FeedContext';
import { ImageViewerProvider } from '@/components/provider/ImageViewerProvider';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { SocketProvider } from '@/components/provider/SocketProvider';
import { ChatProvider } from '@/features/chat/context/ChatContext';
import { ChatDock } from '@/features/chat/components/dock/ChatDock';
import { CryptoGuard } from '@/features/crypto/context/CryptoGuard';

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
              <CryptoGuard>
                <SocketProvider>
                  <ChatProvider>
                    <EmojiPickerProvider>
                      <ImageViewerProvider>
                        <CreatePostProvider>
                          <MainLayout
                            isAuthenticated={isAuthenticated}
                            modal={modal}
                          >
                            {children}
                          </MainLayout>
                          <ChatDock />
                        </CreatePostProvider>
                      </ImageViewerProvider>
                    </EmojiPickerProvider>
                    <Toaster position="top-right" expand />
                  </ChatProvider>
                </SocketProvider>
              </CryptoGuard>
            </QueryProvider>
          </AuthGuard>
        </AppInitializer>
      </body>
    </html>
  );
}

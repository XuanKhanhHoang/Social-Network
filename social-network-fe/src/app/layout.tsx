import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/services/auth';
import { UserProvider } from '@/components/provider/UserProvider';
import { redirect } from 'next/navigation';
import { AppInitializer } from '@/components/features/layout/AppInitializer';
import LeftSidebar from '@/components/features/layout/LeftSideBar';
import { CreatePostProvider } from '@/components/features/feed/FeedContext';
import { UserSummaryDto } from '@/lib/dtos';

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
  const hdrs = await headers();
  const isPublic = hdrs.get('x-route-public') != 'false';
  let user: UserSummaryDto | undefined;

  if (typeof window == 'undefined') {
    if (!isPublic) {
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
          if (!user) throw new Error('Service return null/undefined user!');
        } catch (error) {
          console.log(error);
          redirect('/login?session_expired=true');
        }
      } else {
        redirect('/login');
      }
    } else {
      user = undefined;
    }
  }

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppInitializer>
          <UserProvider initialUser={user}>
            <QueryProvider>
              <EmojiPickerProvider>
                <CreatePostProvider>
                  {isPublic ? (
                    <>
                      {children}
                      {modal}
                    </>
                  ) : (
                    <div className="min-h-screen bg-white">
                      <div className="max-w-screen mx-auto flex">
                        <LeftSidebar />
                        {children}
                        {modal}
                      </div>
                    </div>
                  )}
                </CreatePostProvider>
              </EmojiPickerProvider>
              <Toaster position="top-right" expand />
            </QueryProvider>
          </UserProvider>
        </AppInitializer>
      </body>
    </html>
  );
}

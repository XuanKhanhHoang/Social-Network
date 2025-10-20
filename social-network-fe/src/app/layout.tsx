import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/services/auth';
import { User } from '@/lib/dtos';
import { UserProvider } from '@/components/provider/UserProvider';
import { redirect } from 'next/navigation';
import { AppInitializer } from '@/components/features/layout/AppInitializer';
import LeftSidebar from '@/components/features/layout/LeftSideBar';
import { CreatePostProvider } from '@/components/features/feed/FeedContext';

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
  let user: User | undefined;
  console.log(`\n [LAYOUT] ALL CHECK URL: ${hdrs.get('x-route-url')}`);

  if (typeof window == 'undefined') {
    console.log(
      `\n--- [LAYOUT] BẮT ĐẦU RENDER: Route là ${
        isPublic ? 'PUBLIC / SEMI-PUBLIC' : 'PRIVATE'
      }`
    );
    console.log(`\n [LAYOUT] SERVER CHECK URL: ${hdrs.get('x-route-url')}`);

    if (!isPublic) {
      console.log('[LAYOUT] Route là PRIVATE. Đang kiểm tra token...');
      const cookieStore = await cookies();
      const accessToken = cookieStore.get('accessToken')?.value;
      const refreshToken = cookieStore.get('refreshToken')?.value;

      if (accessToken || refreshToken) {
        console.log('[LAYOUT] Tìm thấy token. Đang thử xác thực user...');
        try {
          user = await authService.verifyUser({
            headers: {
              Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
            },
          });
          if (!user) throw new Error('Service trả về user null/undefined');
          console.log(`[LAYOUT] Xác thực thành công. User: ${user.username}`);
        } catch (error) {
          console.error('[LAYOUT] Lỗi xác thực token.');
          console.log(
            '[LAYOUT] Lỗi trên trang PRIVATE. Redirect sang /login?session_expired=true'
          );
          redirect('/login?session_expired=true');
        }
      } else {
        console.log('[LAYOUT] Không tìm thấy token (Guest).');
        console.log('[LAYOUT] Guest vào trang PRIVATE. Redirect sang /login.');
        redirect('/login');
      }
    } else {
      console.log('[LAYOUT] Route là PUBLIC/SEMI-PUBLIC. Bỏ qua xác thực.');
      user = undefined; // User là undefined cho trang public
    }
  }

  // KHÔNG CẦN block `if (!isPublic && !user)` nữa, vì logic trên đã xử lý hết.
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

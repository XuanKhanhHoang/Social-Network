import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { EmojiPickerProvider } from '@/components/provider/EmojiPickerProvider';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { cookies, headers } from 'next/headers';
import { authService } from '@/services/auth';
import { User } from '@/types-define/dtos';
import { UserProvider } from '@/components/provider/UserProvider';
import { redirect } from 'next/navigation';
import { AppInitializer } from '@/components/features/layout/AppInitializer';

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
  const isPublic = hdrs.get('x-route-public') === 'true';
  let user: User | undefined;
  if (!isPublic) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')!.value;
    try {
      user = await authService.verifyUser({
        headers: {
          Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });
      if (!user) throw new Error();
    } catch (error) {
      redirect('/login');
    }
  }
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AppInitializer>
          <UserProvider initialUser={user}>
            <QueryProvider>
              <EmojiPickerProvider>
                {children}
                {modal}
              </EmojiPickerProvider>
              <Toaster position="top-right" expand />
            </QueryProvider>
          </UserProvider>
        </AppInitializer>
      </body>
    </html>
  );
}

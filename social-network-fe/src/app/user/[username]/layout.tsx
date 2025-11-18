'use client';

import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Edit3,
  Plus,
  Users,
  Grid3x3,
  Newspaper,
  MessageCircle,
  UserPlus,
  Lock,
} from 'lucide-react';
import Link from 'next/link'; // <-- Import Link
import { usePathname, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserHeader } from '@/hooks/user/useUser';
import { useStore } from '@/store';

type ProfileType = 'OWNER' | 'FRIEND' | 'PUBLIC';
type ViewAsType = 'OWNER' | 'FRIEND' | 'PUBLIC_LOGGED_IN' | 'PUBLIC_LOGGED_OUT';

function ProfileHeaderSkeleton() {
  return (
    <header className="bg-card border-b border-border">
      <Skeleton className="h-[350px] w-full rounded-b-lg" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-end -translate-y-[50px]">
          <Skeleton className="w-40 h-40 rounded-full border-4 border-background" />
          <div className="flex-grow ml-5 pb-4">
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex gap-2 pb-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileActions({ viewAsType }: { viewAsType: ViewAsType }) {
  if (viewAsType === 'OWNER') {
    return (
      <>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm vào tin
        </Button>
        <Button variant="secondary">
          <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa trang
        </Button>
      </>
    );
  }

  if (viewAsType === 'FRIEND') {
    return (
      <>
        <Button variant="secondary">
          <Users className="mr-2 h-4 w-4" /> Bạn bè
        </Button>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_IN') {
    return (
      <>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Thêm bạn bè
        </Button>
        <Button variant="secondary">
          <MessageCircle className="mr-2 h-4 w-4" /> Nhắn tin
        </Button>
      </>
    );
  }

  if (viewAsType === 'PUBLIC_LOGGED_OUT') {
    return (
      <Link href="/login" passHref>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Đăng nhập để thêm bạn
        </Button>
      </Link>
    );
  }

  return null;
}

function LoginPrompt({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg border">
      <Lock size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">Trang cá nhân riêng tư</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Vui lòng đăng nhập để xem thông tin chi tiết, bài viết và các hoạt động
        khác của {name}.
      </p>
      <Link href="/login" passHref>
        <Button className="mt-6">Đăng nhập</Button>
      </Link>
    </div>
  );
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const username = params.username as string;

  const { data: header, isLoading, isError } = useUserHeader(username);
  const userAuth = useStore((s) => s.user);

  const viewAsType = useMemo((): ViewAsType | null => {
    if (!header) return null;

    const isLoggedIn = !!userAuth;
    const profileType = header.headerType as ProfileType;

    if (profileType === 'OWNER') return 'OWNER';
    if (profileType === 'FRIEND') return 'FRIEND';
    if (profileType === 'PUBLIC' && isLoggedIn) return 'PUBLIC_LOGGED_IN';
    if (profileType === 'PUBLIC' && !isLoggedIn) return 'PUBLIC_LOGGED_OUT';

    return null;
  }, [header, userAuth]);

  const getActiveTab = useCallback(() => {
    if (!username) return 'timeline';
    if (pathname === `/user/${username}/photos`) return 'photos';
    if (pathname === `/user/${username}/friends`) return 'friends';
    return 'timeline';
  }, [pathname, username]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [getActiveTab, pathname, username]);

  if (isLoading || !viewAsType) {
    return (
      <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
        <ProfileHeaderSkeleton />
        <div className="text-center p-10">Đang tải...</div>
      </div>
    );
  }

  if (isError || !header) {
    return (
      <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
        <div className="text-center p-10 text-xl font-semibold">
          Không tìm thấy người dùng.
        </div>
      </div>
    );
  }

  const fullName = `${header.firstName} ${header.lastName}`;

  return (
    <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
      <header className="bg-card border-b border-border">
        <div
          className="h-[350px] bg-cover bg-center rounded-b-lg"
          style={{
            backgroundImage: header?.coverPhoto
              ? `url(${header?.coverPhoto})`
              : undefined,
            backgroundColor: !header?.coverPhoto ? '#ccc' : undefined,
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-end -translate-y-[50px]">
            <Avatar className="w-40 h-40 border-4 border-background">
              <AvatarImage
                src={header.avatar || '/user.jpg'}
                alt={header.username}
              />
              <AvatarFallback>{header.firstName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-grow ml-5 pb-4">
              <h1 className="text-3xl font-bold">{fullName}</h1>

              <p className="text-muted-foreground font-medium h-5">
                {(viewAsType === 'OWNER' || viewAsType === 'FRIEND') &&
                header.friendCount != undefined
                  ? `${header.friendCount} bạn bè`
                  : ''}
              </p>
            </div>

            <div className="flex gap-2 pb-4">
              <ProfileActions viewAsType={viewAsType} />
            </div>
          </div>
        </div>
      </header>

      {viewAsType !== 'PUBLIC_LOGGED_OUT' ? (
        <Tabs value={activeTab} className="w-full">
          <div className="bg-card border-b">
            <TabsList className="max-w-6xl mx-auto px-4 h-14 bg-card shadow-none rounded-none">
              <Link href={`/user/${username}`} passHref>
                <TabsTrigger
                  value="timeline"
                  className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
                >
                  <Newspaper className="w-4 h-4 mr-2" />
                  Bài viết
                </TabsTrigger>
              </Link>

              <Link href={`/user/${username}/photos`} passHref>
                <TabsTrigger
                  value="photos"
                  className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Ảnh
                </TabsTrigger>
              </Link>

              {(viewAsType === 'OWNER' || viewAsType === 'FRIEND') && (
                <Link href={`/user/${username}/friends`} passHref>
                  <TabsTrigger
                    value="friends"
                    className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bạn bè
                  </TabsTrigger>
                </Link>
              )}
            </TabsList>
          </div>
        </Tabs>
      ) : (
        <div className="h-14" />
      )}

      <main className="max-w-6xl mx-auto px-4 mt-6 ">
        {viewAsType !== 'PUBLIC_LOGGED_OUT' ? (
          <Suspense fallback={<div>Đang tải nội dung...</div>}>
            {children}
          </Suspense>
        ) : (
          <LoginPrompt name={header.firstName} />
        )}
      </main>
    </div>
  );
}

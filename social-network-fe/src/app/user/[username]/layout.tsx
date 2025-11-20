'use client';

import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useParams } from 'next/navigation';
import { useUserHeader } from '@/hooks/user/useUser';
import { useStore } from '@/store';
import {
  ProfileActions,
  ViewAsType,
} from '@/components/features/profile-header/ProfileActions';
import { ProfileTabs } from '@/components/features/profile-header/ProfileTab';
import { LoginPrompt } from '@/components/features/profile-header/LoginPrompt';
import { ProfileHeaderSkeleton } from '@/components/features/profile-header/ProfileHeaderSkeleton';

type ProfileType = 'OWNER' | 'FRIEND' | 'PUBLIC';

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
              ? `url(${header?.coverPhoto.url})`
              : undefined,
            backgroundColor: !header?.coverPhoto ? '#ccc' : undefined,
          }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-end -translate-y-[50px]">
            <Avatar className="w-40 h-40 border-4 border-background">
              <AvatarImage
                src={header.avatar?.url || '/user.jpg'}
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
        <ProfileTabs
          activeTab={activeTab}
          username={username}
          viewAsType={viewAsType}
        />
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

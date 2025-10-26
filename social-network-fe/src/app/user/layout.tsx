'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/user/useUser';

type ProfileType = 'OWNER' | 'FRIEND' | 'PUBLIC';

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

function ProfileActions({ profileType }: { profileType: ProfileType }) {
  if (profileType === 'OWNER') {
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

  if (profileType === 'FRIEND') {
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

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const username = params.username as string;

  const { data: userProfile, isLoading, isError } = useUserProfile(username);

  const profileType = useMemo((): ProfileType | null => {
    if (!userProfile) return null;
    if ('privacySettings' in userProfile) return 'OWNER';
    if ('friendCount' in userProfile) return 'FRIEND';
    return 'PUBLIC';
  }, [userProfile]);

  const getActiveTab = () => {
    if (!username) return 'timeline';
    if (pathname === `/user/${username}/photos`) return 'photos';
    if (pathname === `/user/${username}/friends`) return 'friends';
    return 'timeline';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname, username]);

  if (isLoading || !profileType) {
    return (
      <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
        <ProfileHeaderSkeleton />
        <div className="text-center p-10">Đang tải...</div>
      </div>
    );
  }

  if (isError || !userProfile) {
    return (
      <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
        <div className="text-center p-10 text-xl font-semibold">
          Không tìm thấy người dùng.
        </div>
      </div>
    );
  }

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
      <header className="bg-card border-b border-border">
        <div
          className="h-[350px] bg-cover bg-center rounded-b-lg"
          style={{ backgroundImage: `url(${userProfile.coverPhoto})` }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-end -translate-y-[50px]">
            <Avatar className="w-40 h-40 border-4 border-background">
              <AvatarImage
                src={userProfile.avatar}
                alt={userProfile.username}
              />
              <AvatarFallback>{userProfile.firstName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-grow ml-5 pb-4">
              <h1 className="text-3xl font-bold">{fullName}</h1>

              {(profileType === 'OWNER' || profileType === 'FRIEND') &&
                'friendCount' in userProfile && (
                  <p className="text-muted-foreground font-medium">
                    {userProfile.friendCount} bạn bè
                  </p>
                )}
            </div>

            <div className="flex gap-2 pb-4">
              <ProfileActions profileType={profileType} />
            </div>
          </div>
        </div>
      </header>

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

            {(profileType === 'OWNER' || profileType === 'FRIEND') && (
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

      <main className="max-w-6xl mx-auto px-4 mt-6 ">
        <Suspense fallback={<div>Đang tải nội dung...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}

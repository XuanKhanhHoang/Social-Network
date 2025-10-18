'use client'; // Cần cho "hasActiveStory" và "Tabs" (quản lý active state)

import React, { useState, useEffect, Suspense } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit3, Plus, Users, Grid3x3, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook để biết tab nào đang active

// Giả lập data (bạn sẽ fetch data thật ở đây)
const fakeUser = {
  id: '1',
  username: 'me',
  name: 'Tên Người Dùng',
  friendCount: 204,
  avatarUrl: `https://picsum.photos/seed/me/168`,
  coverUrl: `https://picsum.photos/seed/me-cover/1200/350`,
  hasActiveStory: true,
};

// Interface cho layout
interface MeLayoutProps {
  children: React.ReactNode;
}

export default function MeLayout({ children }: MeLayoutProps) {
  const pathname = usePathname();

  // Logic để xác định tab nào đang active dựa trên URL
  const getActiveTab = () => {
    if (pathname === '/me/photos') return 'photos';
    if (pathname === '/me/friends') return 'friends';
    return 'timeline'; // Mặc định là 'timeline' (/me)
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Cập nhật tab active khi URL thay đổi (người dùng bấm back/forward)
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  return (
    <div className="bg-background text-foreground min-h-screen mx-auto w-full max-w-6xl">
      {/* 1. PHẦN HEADER (Chung cho mọi trang con) */}
      <header className="bg-card border-b border-border">
        <div
          className="h-[350px] bg-cover bg-center rounded-b-lg"
          style={{ backgroundImage: `url(${fakeUser.coverUrl})` }}
        />
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-end -translate-y-[50px]">
            <button
              className={`relative rounded-full focus:outline-none ${
                fakeUser.hasActiveStory
                  ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-background'
                  : ''
              }`}
            >
              <Avatar className="w-40 h-40 border-4 border-background">
                <AvatarImage src={fakeUser.avatarUrl} alt={fakeUser.name} />
                <AvatarFallback>{fakeUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
            <div className="flex-grow ml-5 pb-4">
              <h1 className="text-3xl font-bold">{fakeUser.name}</h1>
              <p className="text-muted-foreground font-medium">
                {fakeUser.friendCount} bạn bè
              </p>
            </div>
            <div className="flex gap-2 pb-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Thêm vào tin
              </Button>
              <Button variant="secondary">
                <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa trang
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. THANH NAV (Tabs tổng) (Chung cho mọi trang con) */}
      <Tabs value={activeTab} className="w-full">
        <div className="bg-card border-b">
          <TabsList className="max-w-6xl mx-auto px-4 h-14 bg-card shadow-none rounded-none">
            <Link href="/me" passHref>
              <TabsTrigger
                value="timeline"
                className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
              >
                <Newspaper className="w-4 h-4 mr-2" />
                Bài viết
              </TabsTrigger>
            </Link>

            <Link href="/me/photos" passHref>
              <TabsTrigger
                value="photos"
                className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
              >
                <Grid3x3 className="w-4 h-4 mr-2" />
                Ảnh
              </TabsTrigger>
            </Link>

            <Link href="/me/friends" passHref>
              <TabsTrigger
                value="friends"
                className="px-4 py-2 data-[state=active]:shadow-none data-[state=active]:text-sky-500 cursor-pointer"
              >
                <Users className="w-4 h-4 mr-2" />
                Bạn bè
              </TabsTrigger>
            </Link>
          </TabsList>
        </div>
      </Tabs>

      {/* 3. NỘI DUNG TRANG CON (Thay đổi theo URL) */}
      <main className="max-w-6xl mx-auto px-4 mt-6 ">
        {/* Next.js sẽ tự động render page.tsx con vào đây */}
        <Suspense fallback={<div>Đang tải...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}

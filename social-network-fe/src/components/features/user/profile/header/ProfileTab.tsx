'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Grid3x3, Users } from 'lucide-react';
import Link from 'next/link';
import { ViewAsType } from './ProfileActions';

interface ProfileTabsProps {
  activeTab: string;
  username: string;
  viewAsType: ViewAsType;
}

export function ProfileTabs({
  activeTab,
  username,
  viewAsType,
}: ProfileTabsProps) {
  return (
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
  );
}

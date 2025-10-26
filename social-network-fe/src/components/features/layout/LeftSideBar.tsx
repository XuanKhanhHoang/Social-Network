'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Bell,
  Users,
  User,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react';
import { useStore } from '@/store';
import { useLogout } from '@/hooks/auth/useAuth';
import { useCreatePostContext } from '../feed/FeedContext';

const NAV_ITEMS = [
  { id: 'home', label: 'Trang chủ', icon: Home, href: '/' },
  { id: 'search', label: 'Tìm kiếm', icon: Search, href: '#' },
  { id: 'explore', label: 'Khám phá', icon: Compass, href: '#' },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageCircle,
    href: '#',
    badge: 3,
  },
  { id: 'notifications', label: 'Thông báo', icon: Bell, href: '#', badge: 5 },
  { id: 'friends', label: 'Bạn bè', icon: Users, href: '#' },
  { id: 'profile', label: 'Trang cá nhân', icon: User, href: '/user' },
];

const VibeLogo = () => (
  <div className="logo-section flex items-center gap-3 py-5 border-b border-gray-100 px-6">
    <img src="/logo.png" alt="" className="w-10 h-10" />
    <div className="logo-text text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
      Vibe
    </div>
  </div>
);

const SidebarFooter = () => {
  const { mutate: logout, isPending } = useLogout();
  return (
    <div className="border-t border-gray-100 px-6 py-4">
      <div className="flex gap-4 text-xs">
        <a
          href="#"
          className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center"
        >
          <Settings className="w-4 h-4 mr-1" />
          Cài đặt
        </a>
        <button
          onClick={() => logout()}
          className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-1" />
          {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    </div>
  );
};

const LeftSidebar = () => {
  const [activeItem, setActiveItem] = useState('home');
  const user = useStore((s) => s.user);
  const userName = `${user?.firstName} ${user?.lastName}`;
  const { openCreate } = useCreatePostContext();

  const userHandle = '@johndoe';

  return (
    <aside className="w-60 bg-white border-r border-gray-200 sticky top-0 h-screen flex flex-col max-w-[240px] flex-shrink-0">
      <VibeLogo />

      <div className="flex items-center gap-3 py-4 border-b border-gray-100 px-6">
        <Avatar className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0">
          <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
            {user?.firstName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {userName}
          </span>
          <span className="text-gray-500 text-xs truncate">{userHandle}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeItem;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveItem(item.id)}
              className={`flex items-center gap-4 py-3 px-6 text-sm font-medium transition-colors relative 
                                ${
                                  isActive
                                    ? 'text-indigo-600 bg-indigo-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-3">
        <Button
          className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-full font-semibold shadow-md transition-all flex items-center gap-2"
          onClick={openCreate}
        >
          <Plus className="w-5 h-5" />
          <span>Tạo bài viết</span>
        </Button>
      </div>

      <SidebarFooter />
    </aside>
  );
};

export default LeftSidebar;

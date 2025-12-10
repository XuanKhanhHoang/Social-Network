'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Flag,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { adminAuthService } from '@/features/admin/auth/services/auth.service';
import { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    id: 'reports',
    label: 'Báo cáo vi phạm',
    icon: Flag,
    href: '/admin/reports',
  },
  {
    id: 'users',
    label: 'Người dùng',
    icon: Users,
    href: '/admin/users',
  },
  {
    id: 'posts',
    label: 'Bài viết',
    icon: FileText,
    href: '/admin/posts',
  },
  {
    id: 'comments',
    label: 'Bình luận',
    icon: MessageSquare,
    href: '/admin/comments',
  },
];

const AdminLogo = ({ isExpanded }: { isExpanded: boolean }) => (
  <div
    className={cn(
      'flex items-center py-5 border-b transition-all duration-300 ease-in-out',
      isExpanded ? 'px-6' : 'px-5'
    )}
  >
    <NextImage
      src="/logo.png"
      alt="Vibe Admin"
      width={32}
      height={32}
      className="w-8 h-8 flex-shrink-0 object-contain"
    />
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0',
        isExpanded ? 'max-w-[200px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
      )}
    >
      <div className="text-lg font-semibold text-gray-900">Vibe Admin</div>
    </div>
  </div>
);

const SidebarFooter = ({ isExpanded }: { isExpanded: boolean }) => {
  const handleLogout = () => {
    adminAuthService.logout();
  };

  return (
    <div
      className={cn(
        'border-t py-4 flex flex-col transition-all duration-300 ease-in-out',
        isExpanded ? 'px-6' : 'px-5'
      )}
    >
      {isExpanded ? (
        <div className="flex gap-4 text-xs">
          <Link
            href="/admin/settings"
            className="text-gray-500 hover:text-gray-900 transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Cài đặt
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-900 transition-colors flex items-center cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/settings"
                  className="text-gray-500 hover:text-gray-900 transition-colors p-0 flex items-center justify-start"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Cài đặt</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer p-0 flex items-center justify-start"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export function AdminSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside
      className={cn(
        'bg-white border-r sticky top-0 h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50',
        isExpanded ? 'w-56' : 'w-16'
      )}
    >
      <AdminLogo isExpanded={isExpanded} />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            const LinkContent = (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center transition-all duration-200 relative group flex-shrink-0',
                  'h-10',
                  isExpanded
                    ? 'mx-3 px-3 text-sm rounded-md'
                    : 'mx-2 w-12 justify-center rounded-md',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'flex-shrink-0 transition-all duration-200',
                    'w-5 h-5',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}
                />

                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out flex-shrink-0',
                    isExpanded
                      ? 'max-w-[200px] opacity-100 ml-3'
                      : 'max-w-0 opacity-0 ml-0'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return LinkContent;
          })}
        </TooltipProvider>
      </nav>

      <SidebarFooter isExpanded={isExpanded} />

      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-white shadow-sm border-gray-200 hover:bg-gray-50 flex items-center justify-center p-0"
          onClick={toggleSidebar}
        >
          <PanelLeft
            className={cn(
              'h-3 w-3 text-gray-500 transition-transform duration-300',
              !isExpanded && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </aside>
  );
}

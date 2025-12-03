'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Home,
  Search,
  MessageCircle,
  Bell,
  Users,
  User,
  Settings,
  LogOut,
  Plus,
  PanelLeft,
} from 'lucide-react';
import { useStore } from '@/store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCreatePostContext } from '@/features/post/components/feed/FeedContext';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAppSidebarContext } from '@/components/provider/AppSidebarProvider';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NotificationSheet } from '@/features/notification/components/NotificationSheet';
import { ChatSheet } from '@/features/chat/components/ChatSheet';
import { GlobalBadge } from '@/features/chat/components/GlobalBadge';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { id: 'home', label: 'Trang chủ', icon: Home, href: '/' },
  { id: 'search', label: 'Tìm kiếm', icon: Search, href: '/search' },
  {
    id: 'messages',
    label: 'Tin nhắn',
    icon: MessageCircle,
    badge: 3,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: Bell,
  },
  { id: 'friends', label: 'Bạn bè', icon: Users, href: '/friends' },
  { id: 'profile', label: 'Trang cá nhân', icon: User, href: '/user/' },
];

const VibeLogo = ({ isExpanded }: { isExpanded: boolean }) => (
  <div
    className={cn(
      'logo-section flex items-center py-5 border-b border-gray-100 transition-all duration-300 ease-in-out',
      isExpanded ? 'pl-6' : 'pl-5'
    )}
  >
    <NextImage
      src="/logo.png"
      alt="Vibe Logo"
      width={40}
      height={40}
      className="w-10 h-10 flex-shrink-0 object-contain"
    />
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0',
        isExpanded ? 'max-w-[200px] opacity-100 ml-3' : 'max-w-0 opacity-0 ml-0'
      )}
    >
      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Vibe
      </div>
    </div>
  </div>
);

const SidebarFooter = ({ isExpanded }: { isExpanded: boolean }) => {
  const { mutate: logout, isPending } = useLogout();

  return (
    <div
      className={cn(
        'border-t border-gray-100 py-4 flex flex-col transition-all duration-300 ease-in-out',
        isExpanded ? 'pl-6' : 'pl-[28px]'
      )}
    >
      {isExpanded ? (
        <div className="flex gap-4 text-xs animate-in fade-in duration-300">
          <Link
            href="/settings/profile"
            className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-1" />
            Cài đặt
          </Link>
          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-indigo-500 transition-colors flex items-center cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-1" />
            {isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings/profile"
                  className="text-gray-400 hover:text-indigo-500 transition-colors p-0 flex items-center justify-start"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Cài đặt</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => logout()}
                  className="text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer p-0 flex items-center justify-start"
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

const LeftSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const userName = `${user?.lastName || ''} ${user?.firstName || ''}`.trim();
  const { openCreate } = useCreatePostContext();
  const { isExpanded, expandSidebar, collapseSidebar } = useAppSidebarContext();

  const userHandle = user?.username ? `@${user.username}` : '';

  const toggleSidebar = () => {
    if (isExpanded) {
      collapseSidebar();
    } else {
      expandSidebar();
    }
  };

  const unreadNotifyCount = useStore((s) => s.unreadCount);

  const handleNavigation = (href: string) => {
    if (pathname === href) {
      router.refresh();
    }
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 sticky top-0 h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <VibeLogo isExpanded={isExpanded} />

      <div
        className={cn(
          'flex items-center py-4 border-b border-gray-100 transition-all duration-300 ease-in-out',
          isExpanded ? 'pl-6' : 'pl-5'
        )}
      >
        <UserAvatar
          name={user?.firstName}
          src={user?.avatar?.url || '/user.jpg'}
          className="w-10 h-10 bg-blue-500 rounded-md flex-shrink-0"
          size={128}
        />

        <div
          className={cn(
            'flex flex-col overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0',
            isExpanded
              ? 'max-w-[150px] opacity-100 ml-3'
              : 'max-w-0 opacity-0 ml-0'
          )}
        >
          <span className="font-semibold text-gray-900 text-sm truncate">
            {userName || 'User'}
          </span>
          <span className="text-gray-500 text-xs truncate">{userHandle}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide flex flex-col items-center gap-1">
        <TooltipProvider delayDuration={0}>
          {NAV_ITEMS.map((item) => {
            const targetHref =
              item.id === 'profile'
                ? `/user/${user?.username}`
                : item.href || '#';

            let isActive = false;
            if (item.id === 'home') {
              isActive = pathname === '/';
            } else if (item.href && item.href !== '/' && item.href !== '#') {
              isActive = pathname.startsWith(item.href);
            } else if (item.id === 'profile' && user?.username) {
              isActive = pathname.startsWith(`/user/${user.username}`);
            }

            const Icon = item.icon;

            const LinkContent = (
              <Link
                key={item.id}
                href={targetHref}
                onClick={() => handleNavigation(targetHref)}
                className={cn(
                  'flex items-center transition-all duration-200 relative group flex-shrink-0',
                  'h-11',
                  isExpanded
                    ? 'w-[calc(100%-16px)] pl-4 text-sm font-medium rounded-md mx-2'
                    : 'w-11 rounded-md pl-2.5',
                  isActive
                    ? 'bg-blue-50 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'flex-shrink-0 transition-all duration-200',
                    'w-6 h-6',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 group-hover:text-gray-900'
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

                {item.id === 'notifications' && unreadNotifyCount > 0 && (
                  <span
                    className={cn(
                      'bg-red-500 text-white text-xs rounded-md font-semibold flex items-center justify-center transition-all duration-300',
                      isExpanded
                        ? 'ml-auto px-2 py-0.5'
                        : 'absolute -top-1 -right-1 w-4 h-4 text-[10px] border-2 border-white rounded-full'
                    )}
                  >
                    {unreadNotifyCount}
                  </span>
                )}
              </Link>
            );

            if (item.id === 'notifications') {
              return (
                <NotificationSheet
                  key={item.id}
                  tooltip={!isExpanded ? item.label : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center transition-all duration-200 relative group flex-shrink-0 cursor-pointer',
                      'h-11',
                      isExpanded
                        ? 'w-[calc(100%-16px)] pl-4 text-sm font-medium rounded-md mx-2'
                        : 'w-11 rounded-md pl-2.5',
                      isActive
                        ? 'bg-blue-50 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'flex-shrink-0 transition-all duration-200',
                        'w-6 h-6',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-500 group-hover:text-gray-900'
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

                    {unreadNotifyCount > 0 && (
                      <span
                        className={cn(
                          'bg-red-500 text-white text-xs rounded-md font-semibold flex items-center justify-center transition-all duration-300',
                          isExpanded
                            ? 'ml-auto px-2 py-0.5'
                            : 'absolute -top-1 -right-1 w-4 h-4 text-[10px] border-2 border-white rounded-full'
                        )}
                      >
                        {unreadNotifyCount}
                      </span>
                    )}
                  </div>
                </NotificationSheet>
              );
            }

            if (item.id === 'messages') {
              return (
                <ChatSheet
                  key={item.id}
                  tooltip={!isExpanded ? item.label : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center transition-all duration-200 relative group flex-shrink-0 cursor-pointer',
                      'h-11',
                      isExpanded
                        ? 'w-[calc(100%-16px)] pl-4 text-sm font-medium rounded-md mx-2'
                        : 'w-11 rounded-md pl-2.5',
                      isActive
                        ? 'bg-blue-50 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <div className="relative">
                      <Icon
                        className={cn(
                          'flex-shrink-0 transition-all duration-200',
                          'w-6 h-6',
                          isActive
                            ? 'text-blue-600'
                            : 'text-gray-500 group-hover:text-gray-900'
                        )}
                      />
                      <GlobalBadge
                        className={cn(
                          'w-3 h-3 border-white absolute',
                          isExpanded ? '-top-1 -right-1' : '-top-1 -right-1'
                        )}
                      />
                    </div>

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
                  </div>
                </ChatSheet>
              );
            }

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

      <div
        className={cn(
          'py-3 transition-all duration-300 ease-in-out flex justify-center',
          isExpanded ? 'px-6' : 'px-2'
        )}
      >
        <TooltipProvider delayDuration={0}>
          <Button
            className={cn(
              'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-semibold shadow-md transition-all flex items-center justify-center rounded-md p-0 overflow-hidden',
              isExpanded ? 'w-full h-11' : 'w-11 h-11'
            )}
            onClick={openCreate}
          >
            <div className="flex items-center justify-center">
              <Plus
                className={cn(
                  'transition-all',
                  isExpanded ? 'w-5 h-5' : 'w-6 h-6'
                )}
              />

              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out',
                  isExpanded
                    ? 'max-w-[100px] opacity-100 ml-2'
                    : 'max-w-0 opacity-0 ml-0'
                )}
              >
                Tạo bài viết
              </span>
            </div>
          </Button>
        </TooltipProvider>
      </div>

      <SidebarFooter isExpanded={isExpanded} />

      <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-50 flex items-center justify-center p-0"
          onClick={toggleSidebar}
        >
          <PanelLeft
            className={cn(
              'h-3 w-3 transition-transform duration-300',
              !isExpanded && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </aside>
  );
};

export default LeftSidebar;

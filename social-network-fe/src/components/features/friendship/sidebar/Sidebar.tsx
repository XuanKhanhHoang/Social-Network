import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { UserPlus, Users, UserX, Home, MapPin, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  requestCount?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'Trang chủ', icon: Home, href: '/friends' },
  {
    id: 'requests',
    label: 'Lời mời kết bạn',
    icon: UserPlus,
    href: '/friends?tab=requests',
  },
  {
    id: 'suggestions',
    label: 'Gợi ý',
    icon: MapPin,
    href: '/friends?tab=suggestions',
  },
  { id: 'all', label: 'Tất cả bạn bè', icon: Users, href: '/friends?tab=all' },
  {
    id: 'blocked',
    label: 'Danh sách chặn',
    icon: UserX,
    href: '/friends?tab=blocked',
  },
];

export default function Sidebar({ requestCount = 0 }: SidebarProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';

  return (
    <div className="w-80 flex-shrink-0 bg-white h-[calc(100vh-64px)] sticky top-0 p-4 border-r border-gray-100">
      <h1 className="text-2xl font-bold mb-6 px-2">Bạn bè</h1>
      <nav className="space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors font-medium text-sm',
                isActive ? 'bg-gray-200' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </div>
              {item.id === 'requests' && requestCount > 0 && (
                <Badge variant="destructive">{requestCount}</Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

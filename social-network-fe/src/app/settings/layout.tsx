'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { User, Shield } from 'lucide-react';
import React from 'react';

const navItems = [
  {
    href: '/settings/profile',
    label: 'Chỉnh sửa hồ sơ',
    icon: User,
  },
  {
    href: '/settings/account',
    label: 'Tài khoản & Mật khẩu',
    icon: Shield,
  },
];

function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted font-semibold'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full mx-auto overflow-hidden">
      <div className="flex flex-row">
        <aside className="p-4 md:border-r">
          <h1 className="text-2xl font-bold ms-2">Cài đặt</h1>
          <div className="border-t my-4" />
          <SettingsNav />
        </aside>

        <main className="flex-1 px-6 py-4">{children}</main>
      </div>
    </div>
  );
}

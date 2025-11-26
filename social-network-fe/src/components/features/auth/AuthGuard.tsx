'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { StoreUser } from '@/store/slices/authSlice';
import { ApiClient } from '@/services/api';

interface AuthGuardProps {
  initialUser?: StoreUser | null;
  children: React.ReactNode;
  isPublic?: boolean;
  isSemiPublic?: boolean;
}

export function AuthGuard({
  initialUser,
  children,
  isPublic,
  isSemiPublic,
}: AuthGuardProps) {
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  useEffect(() => {
    const isPrivate = !isPublic && !isSemiPublic;

    if (isPrivate && !initialUser) {
      setIsChecking(true);
      ApiClient.post('/auth/refresh')
        .then(() => {
          router.refresh();
        })
        .catch(() => {
          router.push('/login');
        });
    } else {
      setIsChecking(false);
    }
  }, [pathname, initialUser, router, isPublic, isSemiPublic]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

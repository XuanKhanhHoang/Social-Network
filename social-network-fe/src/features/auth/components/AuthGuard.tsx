'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { transformToStoreUser } from '@/features/auth/store/authSlice';
import { authService } from '../services/auth.service';

interface AuthGuardProps {
  hasToken: boolean;
  children: React.ReactNode;
  isPublic?: boolean;
  isSemiPublic?: boolean;
}

export function AuthGuard({
  hasToken,
  children,
  isPublic,
  isSemiPublic,
}: AuthGuardProps) {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setKeyVault = useStore((s) => s.setKeyVault);

  const router = useRouter();

  const isPrivate = !isPublic && !isSemiPublic;
  const shouldFetchUser = !user && (hasToken || isPrivate);

  const [isLoading, setIsLoading] = useState(shouldFetchUser);

  useEffect(() => {
    console.log(!user, hasToken, isPrivate);
    if (!shouldFetchUser) return;

    setIsLoading(true);

    authService
      .verifyUser()
      .then((data) => {
        setUser(transformToStoreUser(data));
        if (!hasToken) {
          router.refresh();
        }
        if (data.keyVault) {
          setKeyVault(data.keyVault);
        }

        if (!hasToken) router.refresh();
      })
      .catch(() => {
        if (isPrivate) {
          router.push('/login');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    hasToken,
    user,
    setUser,
    router,
    isPrivate,
    shouldFetchUser,
    setKeyVault,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPrivate && !user) {
    return null;
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { StoreUser } from '@/store/slices/authSlice';

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser?: StoreUser;
  children: React.ReactNode;
}) {
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser, setUser]);

  return <>{children}</>;
}

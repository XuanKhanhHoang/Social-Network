'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';
import { User } from '@/types-define/dtos';

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser?: User;
  children: React.ReactNode;
}) {
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    if (initialUser) setUser(initialUser);
  }, [initialUser, setUser]);

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { authEvents } from '@/lib/event-emitter/auth-event-emitter';

export function GlobalErrorHandler() {
  const router = useRouter();

  const clearStore = useStore((s) => s.clearUser);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearStore();
      if (!window.location.pathname.startsWith('/login')) {
        console.log('Got unauthorized signal!');
        window.location.href = '/login?session_expired=true';
      }
    };

    authEvents.on('unauthenticated', handleUnauthorized);

    return () => {
      authEvents.off('unauthenticated', handleUnauthorized);
    };
  }, [router, clearStore]);

  return null;
}

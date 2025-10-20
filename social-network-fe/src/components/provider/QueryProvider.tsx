'use client';
import { authEvents } from '@/lib/event-emitter/auth-event-emitter';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useState } from 'react';
import { GlobalErrorHandler } from '../others/GlobalErrorHandler';

const handleGlobalError = (error: unknown) => {
  const status = (error as { status?: number })?.status;
  console.log(error);
  console.log(`Error ${status}! Sending unauthenticated signal...`);

  if (status === 401) {
    authEvents.emit('unauthenticated');
  }
};
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: handleGlobalError,
        }),
        mutationCache: new MutationCache({
          onError: handleGlobalError,
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorHandler />
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

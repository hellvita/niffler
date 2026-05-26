'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { triggerExpired } = useSessionExpired();
  const triggerRef = useRef(triggerExpired);

  useEffect(() => {
    triggerRef.current = triggerExpired;
  });

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            if (error instanceof Error && error.message === '401') triggerRef.current();
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            if (error instanceof Error && error.message === '401') triggerRef.current();
          },
        }),
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

'use client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { triggerExpired } = useSessionExpired();
  const [queryClient] = useState(
    () => new QueryClient({
      queryCache: new QueryCache({
        onError: (error: unknown) => {
          if (error instanceof Error && error.message === '401') {
            triggerExpired();
          }
        },
      }),
    })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

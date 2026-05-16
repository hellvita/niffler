'use client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      queryCache: new QueryCache({
        onError: (error: unknown) => {
          if (error instanceof Error && error.message === '401') {
            window.location.href = '/login';
          }
        },
      }),
    })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';

function createQueryClient(on401: () => void) {
  const onError = (error: unknown) => {
    if (error instanceof Error && error.message === '401') on401();
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const { triggerExpired } = useSessionExpired();
  const [queryClient] = useState(() => createQueryClient(triggerExpired));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

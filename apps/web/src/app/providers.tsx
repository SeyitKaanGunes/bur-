'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 dakika
            gcTime: 30 * 60 * 1000, // 30 dakika garbage collection
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1, // Sadece 1 kez retry
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
          mutations: {
            retry: 0, // Mutation'larda retry yapma
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

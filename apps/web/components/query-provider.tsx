"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useWatchlist } from "@/lib/watchlist";

export function QueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
  }));
  useEffect(() => { void useWatchlist.persist.rehydrate(); }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
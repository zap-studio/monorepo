"use client";
import "client-only";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { queryClient } from "../../lib/tanstack-query";

type TanStackQueryProviderProps = {
  children: React.ReactNode;
};

export function TanStackQueryProvider({
  children,
}: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children} <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

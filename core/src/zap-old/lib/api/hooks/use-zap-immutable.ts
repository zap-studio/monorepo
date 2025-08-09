"use client";
import "client-only";

import type { QueryKey } from "@tanstack/react-query";

import {
  useZapQuery,
  type ZapQueryOptions,
} from "@/zap-old/lib/api/hooks/use-zap-query";

export function useZapImmutable<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(options: ZapQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useZapQuery<TQueryFnData, TError, TData, TQueryKey>({
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options,
  });
}

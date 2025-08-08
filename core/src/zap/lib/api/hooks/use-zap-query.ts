"use client";
import "client-only";

import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

interface ZapQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;

  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export function useZapQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>["queryFn"],
  options?: Omit<
    ZapQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey,
    queryFn,
    onSuccess: (data: TData) => {
      if (options?.showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }
      options?.onSuccess?.(data);
    },
    onError: (error: TError) => {
      if (!options?.skipErrorHandling) {
        handleClientError(error);
      }
      options?.onError?.(error);
    },
    ...options,
  });
}

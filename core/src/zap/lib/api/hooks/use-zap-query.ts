"use client";
import "client-only";

import useSWR, { type SWRConfiguration } from "swr";

import { handleClientError } from "@/zap/lib/api/client";

export interface UseZapQueryOptions<TData, TError = unknown>
  extends Omit<SWRConfiguration<TData, TError>, "onSuccess" | "onError"> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  skipErrorHandling?: boolean;
}

export function useZapQuery<TData = unknown, TError = unknown>(
  key: Parameters<typeof useSWR>[0],
  fetcher: Parameters<typeof useSWR>[1],
  options?: UseZapQueryOptions<TData, TError>,
) {
  const {
    onSuccess: zapOnSuccess,
    onError: zapOnError,
    skipErrorHandling = false,
    ...swrOptions
  } = options || {};

  const finalOptions: SWRConfiguration<TData, TError> = {
    ...swrOptions,
    onSuccess: (result) => {
      zapOnSuccess?.(result);
    },
    onError: (err) => {
      if (!skipErrorHandling) {
        handleClientError(err);
      }
      zapOnError?.(err);
    },
  };

  return useSWR(
    key,
    fetcher,
    finalOptions as unknown as SWRConfiguration,
  ) as ReturnType<typeof useSWR<TData, TError>>;
}

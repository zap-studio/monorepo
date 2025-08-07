"use client";
import "client-only";

import type { BareFetcher, Key, SWRConfiguration } from "swr";
import useSWR from "swr";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

type ZapQueryOptions<Data, Error, Fn extends BareFetcher<Data>> = Omit<
  SWRConfiguration<Data, Error, Fn>,
  "onSuccess" | "onError"
> & {
  onSuccess?: (
    data: Data,
    key: string,
    config: Readonly<SWRConfiguration<Data, Error, Fn>>,
  ) => void;
  onError?: (
    error: Error,
    key: string,
    config: Readonly<SWRConfiguration<Data, Error, Fn>>,
  ) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;
};

export function useZapQuery<
  Data = unknown,
  Error = unknown,
  SWRKey extends Key = Key,
>(
  key: SWRKey,
  fetcher: BareFetcher<Data> | null,
  options: ZapQueryOptions<Data, Error, BareFetcher<Data>> = {},
) {
  const {
    showSuccessToast = false,
    successMessage,
    skipErrorHandling = true,
    onSuccess,
    onError,
    ...swrOptions
  } = options;

  return useSWR(key, fetcher, {
    ...swrOptions,
    onSuccess: (data, key, config) => {
      if (showSuccessToast && successMessage) {
        handleSuccess(successMessage);
      }
      onSuccess?.(data, key, config);
    },
    onError: (error, key, config) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
      onError?.(error, key, config);
    },
  });
}

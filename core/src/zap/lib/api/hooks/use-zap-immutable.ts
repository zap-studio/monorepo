"use client";
import "client-only";

import type { BareFetcher, Key, SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

type ZapImmutableOptions<Data, Error, Fn extends BareFetcher<Data>> = Omit<
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

export function useZapImmutable<
  Data = unknown,
  Error = unknown,
  SWRKey extends Key = Key,
>(
  key: SWRKey,
  fetcher: BareFetcher<Data> | null,
  options: ZapImmutableOptions<Data, Error, BareFetcher<Data>> = {},
) {
  const {
    showSuccessToast = false,
    successMessage,
    skipErrorHandling = true,
    onSuccess,
    onError,
    ...swrOptions
  } = options;

  return useSWRImmutable(key, fetcher, {
    ...swrOptions,
    onSuccess: (responseData, responseKey, responseConfig) => {
      if (showSuccessToast && successMessage) {
        handleSuccess(successMessage);
      }
      onSuccess?.(responseData, responseKey, responseConfig);
    },
    onError: (responseError, responseKey, responseConfig) => {
      if (!skipErrorHandling) {
        handleClientError(responseError);
      }
      onError?.(responseError, responseKey, responseConfig);
    },
  });
}

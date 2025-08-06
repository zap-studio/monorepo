"use client";
import "client-only";

import type { Key } from "swr";
import type { MutationFetcher, SWRMutationConfiguration } from "swr/mutation";
import useSWRMutation from "swr/mutation";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

type ZapMutationOptions<
  Data,
  Error,
  SWRMutationKey extends Key,
  ExtraArg,
> = Omit<
  SWRMutationConfiguration<Data, Error, SWRMutationKey, ExtraArg>,
  "onSuccess" | "onError"
> & {
  onSuccess?: (
    data: Data,
    key: string,
    config: Readonly<
      SWRMutationConfiguration<Data, Error, SWRMutationKey, ExtraArg>
    >,
  ) => void;
  onError?: (
    error: Error,
    key: string,
    config: Readonly<
      SWRMutationConfiguration<Data, Error, SWRMutationKey, ExtraArg>
    >,
  ) => void;
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;
};

export function useZapMutation<
  Data = unknown,
  Error = unknown,
  SWRMutationKey extends Key = Key,
  ExtraArg = unknown,
>(
  key: SWRMutationKey,
  fetcher: MutationFetcher<Data, SWRMutationKey, ExtraArg>,
  options: ZapMutationOptions<Data, Error, SWRMutationKey, ExtraArg> = {},
) {
  const {
    showSuccessToast = true,
    successMessage,
    skipErrorHandling = false,
    onSuccess,
    onError,
    ...swrOptions
  } = options;

  return useSWRMutation(key, fetcher, {
    ...swrOptions,
    onSuccess: (data, responseKey, config) => {
      if (showSuccessToast && successMessage) {
        handleSuccess(successMessage);
      }
      onSuccess?.(data, responseKey, config);
    },
    onError: (error, responseKey, config) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
      onError?.(error, responseKey, config);
    },
  });
}

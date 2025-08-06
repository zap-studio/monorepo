"use client";
import "client-only";

import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

export interface UseZapMutationOptions<TData, TError = unknown>
  extends Omit<
    SWRMutationConfiguration<TData, TError>,
    "onSuccess" | "onError"
  > {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  successMessage?: string;
  showSuccessToast?: boolean;
  skipErrorHandling?: boolean;
}

export function useZapMutation<TData = unknown, TError = unknown>(
  key: Parameters<typeof useSWRMutation>[0],
  fetcher: Parameters<typeof useSWRMutation>[1],
  options?: UseZapMutationOptions<TData, TError>,
) {
  const {
    onSuccess: zapOnSuccess,
    onError: zapOnError,
    successMessage,
    showSuccessToast = false,
    skipErrorHandling = false,
    ...swrOptions
  } = options || {};

  const finalOptions: SWRMutationConfiguration<TData, TError> = {
    ...swrOptions,
    onSuccess: (result) => {
      if (showSuccessToast && successMessage) {
        handleSuccess(successMessage);
      }
      zapOnSuccess?.(result);
    },
    onError: (err) => {
      if (!skipErrorHandling) {
        handleClientError(err);
      }
      zapOnError?.(err);
    },
  };

  return useSWRMutation(
    key,
    fetcher,
    finalOptions as unknown as SWRMutationConfiguration<unknown, unknown>,
  ) as unknown as ReturnType<typeof useSWRMutation<TData, TError>>;
}

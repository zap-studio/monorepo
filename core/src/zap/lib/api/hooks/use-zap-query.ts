"use client";
import "client-only";

import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

export interface ZapQueryOptions<
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
  TQueryKey extends QueryKey = readonly unknown[],
>(options: ZapQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const {
    showSuccessToast = false,
    skipErrorHandling = true,
    ...restOptions
  } = options;

  const queryResult = useQuery(restOptions);

  const hasHandledSuccess = useRef(false);
  const hasHandledError = useRef(false);

  useEffect(() => {
    if (restOptions.queryKey) {
      hasHandledSuccess.current = false;
      hasHandledError.current = false;
    }
  }, [restOptions.queryKey]);

  useEffect(() => {
    if (queryResult.isSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;

      if (showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }

      options?.onSuccess?.(queryResult.data);
    }
  }, [options, queryResult.data, queryResult.isSuccess, showSuccessToast]);

  useEffect(() => {
    if (queryResult.isError && !hasHandledError.current) {
      hasHandledError.current = true;

      if (!skipErrorHandling) {
        handleClientError(queryResult.error);
      }

      options?.onError?.(queryResult.error);
    }
  }, [options, queryResult.error, queryResult.isError, skipErrorHandling]);

  return queryResult;
}

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
  const queryResult = useQuery(options);

  const hasHandledSuccess = useRef(false);
  const hasHandledError = useRef(false);

  useEffect(() => {
    if (queryResult.isSuccess && !hasHandledSuccess.current) {
      hasHandledSuccess.current = true;

      if (options?.showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }

      options?.onSuccess?.(queryResult.data);
    }
  }, [queryResult.isSuccess, queryResult.data, options]);

  useEffect(() => {
    if (queryResult.isError && !hasHandledError.current) {
      hasHandledError.current = true;

      if (!options?.skipErrorHandling) {
        handleClientError(queryResult.error);
      }

      options?.onError?.(queryResult.error);
    }
  }, [queryResult.isError, queryResult.error, options]);

  return queryResult;
}

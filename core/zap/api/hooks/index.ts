'use client';
import 'client-only';

import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { handleClientError, handleSuccess } from '@/zap/errors/client';

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

  // Use useMemo to ensure that the queryKey is stable across renders (special case of array reference equality since queryKey is an array)
  const stableQueryKey = useMemo(
    () => restOptions.queryKey,
    [restOptions.queryKey]
  );

  useEffect(() => {
    if (stableQueryKey) {
      hasHandledSuccess.current = false;
      hasHandledError.current = false;
    }
  }, [stableQueryKey]);

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

import { type UseMutationOptions, useMutation } from '@tanstack/react-query';

interface ZapMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;

  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
}

export function useZapMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: ZapMutationOptions<TData, TError, TVariables, TContext>) {
  const {
    showSuccessToast = true,
    skipErrorHandling = false,
    ...restOptions
  } = options;

  return useMutation({
    ...restOptions,
    onSuccess: (data: TData, variables: TVariables, context: TContext) => {
      if (showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: TError, variables: TVariables, context?: TContext) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
      options?.onError?.(error, variables, context);
    },
  });
}

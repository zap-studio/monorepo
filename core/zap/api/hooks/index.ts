'use client';
import 'client-only';

import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
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

  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => void;
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
    onSettled: (
      data: TData | undefined,
      error: TError | null,
      variables: TVariables,
      context: TContext | undefined
    ) => {
      if (showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }
      options?.onSettled?.(data, error, variables, context);
    },
    onError: (error: TError, variables: TVariables, context?: TContext) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
      options?.onError?.(error, variables, context);
    },
  });
}

export type RollbackFn = () => void;

export interface UseZapOptimisticMutationOptions<
  TData,
  TError,
  TVariables,
  TQueryKey extends QueryKey = readonly unknown[],
> extends ZapMutationOptions<TData, TError, TVariables, RollbackFn> {
  queryKey: TQueryKey;
  updater: RollbackFn;
  invalidates?: TQueryKey | TQueryKey[];
}

export function useZapOptimisticMutation<
  TData,
  TError,
  TVariables,
  TQueryKey extends QueryKey = readonly unknown[],
>({
  mutationFn,
  queryKey,
  updater,
  invalidates,
  ...restOptions
}: UseZapOptimisticMutationOptions<TData, TError, TVariables, TQueryKey>) {
  const queryClient = useQueryClient();

  return useZapMutation<TData, TError, TVariables, RollbackFn>({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (currentData) =>
        updater(currentData, variables)
      );

      return () => {
        queryClient.setQueryData(queryKey, snapshot);
      };
    },
    onSettled: (data, error, variables, rollback) => {
      restOptions.onSettled?.(data, error, variables, rollback);

      if (invalidates) {
        queryClient.invalidateQueries({ queryKey: invalidates });
      }
    },
    onError: (error, variables, rollback) => {
      rollback?.();
      restOptions.onError?.(error, variables, rollback);
    },
    ...restOptions,
  });
}

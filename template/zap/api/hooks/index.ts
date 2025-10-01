"use client";
import "client-only";

import {
  type InferDataFromTag,
  type MutationFunctionContext,
  type QueryKey,
  type UseQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { handleClientError, handleSuccess } from "@/zap/errors/client";

/**
 * Options for a Zap query, extending `UseQueryOptions` with additional flags for UI handling.
 *
 * @template TQueryFnData - The type returned by the query function.
 * @template TError - The type of error thrown by the query.
 * @template TData - The type of data returned by the query after optional select transformation.
 * @template TQueryKey - The query key type.
 */
export interface ZapQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> extends UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  /** Whether to show a success toast when the query succeeds */
  showSuccessToast?: boolean;
  /** Optional success message to display */
  successMessage?: string;
  /** Skip the built-in client error handling if true */
  skipErrorHandling?: boolean;
  /** Callback invoked on query success */
  onSuccess?: (data: TData) => void;
  /** Callback invoked on query error */
  onError?: (error: TError) => void;
}

/**
 * A wrapper around `useQuery` that provides optional success/error handling and toast support.
 *
 * @template TQueryFnData - The type returned by the query function.
 * @template TError - The type of error thrown by the query.
 * @template TData - The type of data returned by the query after optional select transformation.
 * @template TQueryKey - The query key type.
 * @param options - Zap query options
 * @returns The result of `useQuery`, including status, data, and error.
 */
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

/**
 * A variant of `useZapQuery` that never refetches, suitable for immutable data.
 *
 * @template TQueryFnData - The type returned by the query function.
 * @template TError - The type of error thrown by the query.
 * @template TData - The type of data returned by the query after optional select transformation.
 * @template TQueryKey - The query key type.
 * @param options - Zap query options
 * @returns The result of `useZapQuery` with infinite stale and GC times.
 */
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

import { type UseMutationOptions, useMutation } from "@tanstack/react-query";

/**
 * Options for a Zap mutation, extending `UseMutationOptions` with additional flags for UI handling.
 *
 * @template TData - The type of data returned by the mutation.
 * @template TError - The type of error thrown by the mutation.
 * @template TVariables - The type of variables passed to the mutation function.
 * @template TOnMutateResult - The type of context returned by `onMutate`.
 */
interface ZapMutationOptions<TData, TError, TVariables, TOnMutateResult>
  extends UseMutationOptions<TData, TError, TVariables, TOnMutateResult> {
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;

  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext
  ) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    onMutateResult: TOnMutateResult | undefined,
    context: MutationFunctionContext
  ) => void;
}

/**
 * A wrapper around `useMutation` that provides optional success/error handling and toast support.
 *
 * @template TData - The type of data returned by the mutation.
 * @template TError - The type of error thrown by the mutation.
 * @template TVariables - The type of variables passed to the mutation function.
 * @template TOnMutateResult - The type of context returned by `onMutate`.
 * @param options - Zap mutation options
 * @returns The result of `useMutation`.
 */
export function useZapMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TOnMutateResult = unknown,
>(options: ZapMutationOptions<TData, TError, TVariables, TOnMutateResult>) {
  const {
    showSuccessToast = true,
    skipErrorHandling = false,
    ...restOptions
  } = options;

  return useMutation({
    ...restOptions,
    // biome-ignore lint/nursery/useMaxParams: We need all these parameters becaue it's a wrapper around Tanstack's useMutation
    onSettled: (
      data: TData | undefined,
      error: TError | null,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext
    ) => {
      if (!error && showSuccessToast && options?.successMessage) {
        handleSuccess(options.successMessage);
      }
      options?.onSettled?.(data, error, variables, onMutateResult, context);
    },
    onError: (
      error: TError,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext
    ) => {
      if (!skipErrorHandling) {
        handleClientError(error);
      }
      options?.onError?.(error, variables, onMutateResult, context);
    },
  });
}

/** Function type for rolling back optimistic updates */
export type RollbackFn = () => void;

/**
 * Options for an optimistic mutation, extending ZapMutationOptions with a cache updater.
 *
 * @template TData - The type of data returned by the mutation.
 * @template TError - The type of error thrown by the mutation.
 * @template TVariables - The type of variables passed to the mutation function.
 * @template TQueryKey - The query key type for the cache.
 */
export interface UseZapOptimisticMutationOptions<
  TData,
  TError,
  TVariables,
  TQueryKey extends QueryKey = readonly unknown[],
> extends ZapMutationOptions<TData, TError, TVariables, RollbackFn> {
  /** The query key identifying the cached query to update */
  queryKey: TQueryKey;
  /** Function that computes the optimistic update */
  updater: (currentData: TData | undefined, variables: TVariables) => TData;
  /** Queries to invalidate after mutation succeeds */
  invalidates?: TQueryKey | TQueryKey[];
}

/**
 * A hook for performing optimistic mutations.
 *
 * Applies an optimistic update to the cache, rolls back on error, and optionally invalidates queries.
 *
 * @template TData - The type of data returned by the mutation.
 * @template TError - The type of error thrown by the mutation.
 * @template TVariables - The type of variables passed to the mutation function.
 * @template TQueryKey - The query key type for the cache.
 * @param options - Options for the optimistic mutation.
 * @returns The result of `useZapMutation`.
 */
export function useZapOptimisticMutation<
  TData extends NoInfer<InferDataFromTag<unknown, TQueryKey>> | undefined,
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
    ...restOptions,
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey });

      const snapshot = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<TData>(queryKey, (currentData) =>
        updater(currentData, variables)
      );

      return () => {
        queryClient.setQueryData(queryKey, snapshot);
      };
    },
    // biome-ignore lint/nursery/useMaxParams: We need all these parameters becaue it's a wrapper around Tanstack's useMutation
    onSettled: (data, error, variables, onMutateResult, rollback) => {
      restOptions.onSettled?.(data, error, variables, onMutateResult, rollback);

      if (!error && invalidates) {
        queryClient.invalidateQueries({ queryKey: invalidates });
      }
    },
    onError: (error, variables, onMutateResult, context) => {
      onMutateResult?.();
      restOptions.onError?.(error, variables, onMutateResult, context);
    },
  });
}

"use client";
import "client-only";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

import { handleClientError, handleSuccess } from "@/zap/lib/api/client";

interface ZapMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  showSuccessToast?: boolean;
  successMessage?: string;
  skipErrorHandling?: boolean;

  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
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

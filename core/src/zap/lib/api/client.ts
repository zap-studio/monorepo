import "client-only";

import { toast } from "sonner";

import { DEV } from "@/lib/env.public";
import { BaseError } from "@/zap/lib/api/errors";

export interface ClientErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  correlationId: string;
  details?: unknown;
}

export function isClientError(error: unknown): error is ClientErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    "message" in error &&
    "code" in error &&
    "statusCode" in error
  );
}

export function handleClientError(
  error: unknown,
  fallbackMessage = "Something went wrong",
) {
  let title = "Error";
  let description = fallbackMessage;

  if (isClientError(error)) {
    title = error.error;
    description = error.message;

    if (error.statusCode === 401) {
      title = "Authentication Required";
      description = "Please sign in to continue";
    } else if (error.statusCode === 403) {
      title = "Access Denied";
      description = "You don't have permission to perform this action";
    } else if (error.statusCode === 400) {
      title = "Invalid Input";
      description = error.message;
    }
  } else if (error instanceof BaseError) {
    title = error.name;
    description = error.message;
  } else if (error instanceof Error) {
    title = "Error";
    description = error.message;
  }

  toast.error(description, {
    description: title !== "Error" ? title : undefined,
  });

  if (DEV) {
    console.error(`[Client Error] ${title}: ${description}`, error);
  }
}

export function handleSuccess(message: string, title?: string) {
  toast.success(message, {
    description: title,
  });
}

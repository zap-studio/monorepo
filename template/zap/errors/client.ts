import "client-only";

import { toast } from "sonner";

import { DEV } from "@/zap/env/runtime/public";

import { ApplicationError, BaseError } from ".";

export function handleClientError(
  error: unknown,
  fallbackMessage = "Something went wrong"
) {
  let title = "Error";
  let description = fallbackMessage;

  if (error instanceof BaseError) {
    title = error.name;
    description = error.message;
  } else if (error instanceof ApplicationError) {
    title = error.name;
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (typeof error === "string") {
    description = error;
  }

  // Show error details in toast in DEV mode
  if (DEV) {
    toast.error(`${title}: ${description}`, {
      description:
        typeof error === "object"
          ? JSON.stringify(error, null, 2)
          : String(error),
    });
    return;
  }

  toast.error(description);
}

export function handleSuccess(message: string, title?: string) {
  toast.success(message, {
    description: title,
  });
}

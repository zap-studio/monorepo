import "client-only";

import { toast } from "sonner";

import { DEV } from "@/lib/env.public";
import { ApplicationError, BaseError } from "@/zap/lib/api/errors";

export function handleClientError(
  error: unknown,
  fallbackMessage = "Something went wrong",
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

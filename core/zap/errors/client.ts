import "client-only";

import { toast } from "sonner";

import { ZAP_AUTH_CONFIG } from "@/zap/auth/zap.plugin.config";
import { DEV } from "@/zap/env/runtime";

import { ApplicationError, BaseError } from ".";

export function handleClientError(
  error: unknown,
  fallbackMessage = "Something went wrong",
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "PASSWORD_COMPROMISED"
  ) {
    toast.error(ZAP_AUTH_CONFIG.PASSWORD_COMPROMISED_MESSAGE);
    return;
  }

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

  toast.error(description);

  if (DEV) {
    console.error(`[Client Error] ${title}: ${description}`, error);
  }
}

export function handleSuccess(message: string, title?: string) {
  toast.success(message, {
    description: title,
  });
}

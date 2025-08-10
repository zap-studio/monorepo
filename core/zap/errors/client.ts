import "client-only";

import { toast } from "sonner";

import { ZAP_CONFIG } from "@/zap.config";
import { ApplicationError, BaseError } from ".";
import { DEV } from "../env/runtime";

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
    toast.error(ZAP_CONFIG.AUTH.PASSWORD_COMPROMISED_MESSAGE);
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

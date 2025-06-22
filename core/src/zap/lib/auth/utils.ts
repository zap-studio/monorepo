import { toast } from "sonner";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";

export function handleCompromisedPasswordError(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "PASSWORD_COMPROMISED"
  ) {
    toast.error(ZAP_DEFAULT_SETTINGS.AUTH.PASSWORD_COMPROMISED_MESSAGE);
  } else {
    toast.error("An error occurred during authentication. Please try again.");
  }

  throw error;
}

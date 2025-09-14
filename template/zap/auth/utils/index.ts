import "server-only";

import { HttpStatus } from "@/zap/errors";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";

export function redirectToLogin(config: Partial<AuthServerPluginConfig>) {
  return Response.redirect(
    config?.LOGIN_URL ?? "/login",
    HttpStatus.TEMPORARY_REDIRECT
  );
}

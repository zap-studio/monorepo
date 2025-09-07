import "server-only";

import { HttpStatus } from "@/zap/errors";
import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

export function redirectToLogin() {
  return Response.redirect(
    ZAP_AUTH_CONFIG.LOGIN_URL,
    HttpStatus.TEMPORARY_REDIRECT
  );
}

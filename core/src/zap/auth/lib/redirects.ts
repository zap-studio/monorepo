import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";

export function redirectToLogin() {
  return Response.redirect(ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL, 307);
}

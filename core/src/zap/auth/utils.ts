import "server-only";

import { ZAP_CONFIG } from "@/zap.config";

export function redirectToLogin() {
  return Response.redirect(ZAP_CONFIG.AUTH.LOGIN_URL, 307);
}

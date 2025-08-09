import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { getAuthData } from "@/zap/auth/services";

export function redirectToLogin() {
  return Response.redirect(ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL, 302);
}

export async function getAuthDataOrRedirectToLogin() {
  const result = await getAuthData();
  if (!result?.session) {
    return redirectToLogin();
  }
  return { user: result.user, session: result.session };
}

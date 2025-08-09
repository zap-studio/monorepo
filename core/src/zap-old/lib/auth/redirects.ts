import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";

import { auth } from "./server";

export function redirectToLogin() {
  return Response.redirect(ZAP_DEFAULT_SETTINGS.AUTH.LOGIN_URL, 302);
}

export async function getAuthDataOrRedirectToLogin(headers: Headers) {
  const result = await auth.api.getSession({
    headers,
  });
  if (!result?.session) {
    return redirectToLogin();
  }
  return { user: result.user, session: result.session };
}

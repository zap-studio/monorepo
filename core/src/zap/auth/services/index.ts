import "server-only";

import { headers } from "next/headers";

import { AuthenticationError, NotFoundError } from "@/zap/api/errors";
import { redirectToLogin } from "@/zap/auth/lib/redirects";
import { betterAuthServer } from "@/zap/auth/providers/better-auth/server";

export async function getSessionService() {
  const _headers = await headers();
  const result = await betterAuthServer.api.getSession({ headers: _headers });

  return result?.session;
}

export async function getAuthServerData() {
  const _headers = await headers();
  const result = await betterAuthServer.api.getSession({ headers: _headers });

  return result;
}

export async function getAuthServerDataOrRedirectToLoginService() {
  const result = await getAuthServerData();
  if (!result?.session) {
    return redirectToLogin();
  }
  return { user: result.user, session: result.session };
}

export async function getUserIdService() {
  const user = await getUserService();

  if (!user) {
    throw new AuthenticationError("User not authenticated");
  }

  return user.id;
}

export async function getUserService() {
  const _headers = await headers();
  const result = await betterAuthServer.api.getSession({ headers: _headers });

  return result?.user;
}

export async function isAuthenticatedService() {
  const session = await getSessionService();

  if (!session) {
    return false;
  }

  return true;
}

export async function isUserAdminService() {
  const user = await getUserService();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return false; // FIXME: Implement actual admin check logic
}

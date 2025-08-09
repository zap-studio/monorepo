import "server-only";

import { headers } from "next/headers";

import { auth } from "@/zap/auth/lib/better-auth/server";
import { AuthenticationError, NotFoundError } from "@/zap-old/lib/api/errors";

export async function getSessionService() {
  const _headers = await headers();
  const result = await auth.api.getSession({ headers: _headers });

  return result?.session;
}

export async function getAuthData() {
  const _headers = await headers();
  const result = await auth.api.getSession({ headers: _headers });

  return result;
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
  const result = await auth.api.getSession({ headers: _headers });

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

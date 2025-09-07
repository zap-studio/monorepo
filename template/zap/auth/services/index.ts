import "server-only";

import { headers } from "next/headers";

import { db } from "@/zap/db/providers/drizzle";
import { AuthenticationError, NotFoundError } from "@/zap/errors";

import { getUserIdFromMailQuery } from "../db/providers/drizzle/queries";
import { user } from "../db/providers/drizzle/schema";
import { betterAuthServer } from "../providers/better-auth/server";
import { redirectToLogin } from "../utils";

export async function getNumberOfUsersService() {
  const count = await db.$count(user);
  return count;
}

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
  const currentUser = await getUserService();

  if (!currentUser) {
    throw new AuthenticationError("User not authenticated");
  }

  return currentUser.id;
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
  const currentUser = await getUserService();

  if (!currentUser) {
    throw new NotFoundError("User not found");
  }

  return false; // FIXME: Implement actual admin check logic
}

type GetUserIdFromMailService = {
  email: string;
};

export async function getUserIdFromMailService({
  email,
}: GetUserIdFromMailService) {
  const records = await getUserIdFromMailQuery.execute({ email });

  const record = records[0];
  if (!record) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  return record.userId;
}

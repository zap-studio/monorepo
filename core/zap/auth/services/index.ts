import "server-only";

import { headers } from "next/headers";

import { db } from "../../db/providers/drizzle";
import { user } from "../../db/providers/drizzle/schema";
import { AuthenticationError, NotFoundError } from "../../errors";
import { getUserIdFromMailQuery } from "../db/queries";
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

interface GetUserIdFromMailService {
  email: string;
}

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

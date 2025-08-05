import "server-only";

import { z } from "zod";

import { auth } from "@/zap/lib/auth/server";
import { UnauthorizedError } from "@/zap/lib/error-handling/errors";

export async function getAuthenticatedSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw new UnauthorizedError("Authentication required");
  }

  return session;
}

export async function parseRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

export async function getAuthenticatedUserId(request: Request) {
  const session = await getAuthenticatedSession(request);
  return session.user.id;
}

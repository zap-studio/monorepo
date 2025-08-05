import "server-only";

import { headers } from "next/headers";

import { base } from "@/rpc/middlewares/base.middleware";
import type { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";

export interface SessionContext {
  readonly session: Session;
  readonly headers: Headers;
}

export const authMiddleware = base.middleware(async ({ next, errors }) => {
  let _headers: Headers;
  try {
    _headers = await headers();
  } catch {
    throw new Error("Failed to get headers");
  }

  let session: Session | null;
  try {
    session = await auth.api.getSession({ headers: _headers });
  } catch {
    throw new Error("Failed to get session");
  }

  if (!session) {
    throw errors.UNAUTHORIZED({
      message: "Unauthorized access",
    });
  }

  try {
    return await next({
      context: {
        session,
        headers: _headers,
      },
    });
  } catch (err) {
    throw new Error("Failed to execute next middleware", { cause: err });
  }
});

import "server-only";

import { ORPCError } from "@orpc/client";
import { headers } from "next/headers";

import { base } from "@/rpc/middlewares/base.middleware";
import { InternalServerError } from "@/zap/lib/api/errors";
import type { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";

export interface SessionContext {
  readonly session: Session;
  readonly headers: Headers;
}

export const authMiddleware = base.middleware(async ({ next }) => {
  const _headers = await headers();

  const session = await auth.api.getSession({ headers: _headers });

  if (!session) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Unauthorized access",
    });
  }

  return await next({
    context: {
      session,
      headers: _headers,
    },
  });
});

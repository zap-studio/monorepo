import "server-only";

import { ORPCError } from "@orpc/client";
import { headers } from "next/headers";

import { base } from "@/zap/api/rpc/middlewares";

import type { Session } from "../../providers/better-auth/client";
import { betterAuthServer } from "../../providers/better-auth/server";

export type SessionContext = {
  readonly session: Session;
  readonly headers: Headers;
};

export const authMiddleware = base.middleware(async ({ next }) => {
  const _headers = await headers();

  const session = await betterAuthServer.api.getSession({ headers: _headers });

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

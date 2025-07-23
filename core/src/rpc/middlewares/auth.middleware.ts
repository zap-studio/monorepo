import "server-only";

import { Effect } from "effect";
import { headers } from "next/headers";

import { base } from "@/rpc/middlewares/base.middleware";
import type { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";

export interface SessionContext {
  readonly session: Session;
  readonly headers: Headers;
}

export const authMiddleware = base.middleware(async ({ next, errors }) => {
  const effect = Effect.gen(function* (_) {
    const _headers = yield* _(
      Effect.tryPromise({
        try: () => headers(),
        catch: () => new Error("Failed to get headers"),
      }),
    );

    const session = yield* _(
      Effect.tryPromise({
        try: async () => auth.api.getSession({ headers: _headers }),
        catch: () => new Error("Failed to get session"),
      }),
    );

    if (!session) {
      return yield* _(
        Effect.fail(
          errors.UNAUTHORIZED({
            message: "Unauthorized access",
          }),
        ),
      );
    }

    return yield* _(
      Effect.tryPromise({
        try: async () =>
          next({
            context: {
              session,
              headers: _headers,
            },
          }),
        catch: () => new Error("Failed to execute next middleware"),
      }),
    );
  });

  return await Effect.runPromise(effect);
});

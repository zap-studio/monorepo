import { Effect } from "effect";

import type { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";

import { base } from "./base.middleware";

export interface SessionContext {
  readonly session: Session;
  readonly headers: Headers;
}

export const authMiddleware = base.middleware(
  async ({ context, next, errors }) => {
    const effect = Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: context.headers }),
          catch: (error) => new Error(`Failed to get session: ${error}`),
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
        Effect.try({
          try: () =>
            next({
              context: {
                session,
                headers: context.headers,
              },
            }),
          catch: (error) =>
            new Error(`Failed to execute next middleware: ${error}`),
        }),
      );
    });

    return await Effect.runPromise(effect);
  },
);

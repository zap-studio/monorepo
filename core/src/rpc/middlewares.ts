import { Session } from "@/zap/lib/auth/client";
import { auth } from "@/zap/lib/auth/server";
import { os } from "@orpc/server";
import { Effect } from "effect";

export interface SessionContext {
  readonly session: Session;
  readonly headers: Headers;
}

export const base = os
  .$context<{
    headers: Headers;
  }>()
  .errors({
    UNAUTHORIZED: {},
  });

export const authMiddleware = base.middleware(
  async ({ context, next, errors }) => {
    const program = Effect.gen(function* (_) {
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

    return Effect.runPromise(
      program.pipe(
        Effect.catchAll((error: unknown) => {
          return Effect.fail(error);
        }),
      ),
    );
  },
);

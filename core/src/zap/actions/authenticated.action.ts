"use server";

import { auth } from "@/zap/lib/auth/server";
import { headers } from "next/headers";
import { Effect } from "effect";

export const getSession = async () => {
  return Effect.tryPromise({
    try: async () => {
      const headersList = await headers();
      return auth.api.getSession({ headers: headersList });
    },
    catch: (e) => e,
  });
};

export const isAuthenticated = async () => {
  return Effect.gen(function* (_) {
    const sessionEffect = yield* _(Effect.promise(() => getSession()));
    const session = yield* _(sessionEffect);

    if (!session) {
      return false;
    }

    return true;
  }).pipe(
    Effect.catchAll((error) => Effect.succeed({ success: false, error })),
  );
};

export const getUserId = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const sessionEffect = yield* _(Effect.promise(() => getSession()));
      const session = yield* _(sessionEffect);

      if (!session) {
        return yield* _(Effect.fail(new Error("User not authenticated")));
      }

      return session.user.id;
    }),
  );
};

export const isUserAdmin = async () => {
  return Effect.gen(function* (_) {
    const sessionEffect = yield* _(Effect.promise(() => getSession()));
    const session = yield* _(sessionEffect);

    if (!session) {
      return false;
    }

    return session.user.role === "admin";
  }).pipe(
    Effect.catchAll((error) => Effect.succeed({ success: false, error })),
  );
};

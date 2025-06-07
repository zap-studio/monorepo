"use server";

import { auth } from "@/zap/lib/auth/server";
import { headers } from "next/headers";
import { Effect } from "effect";

export const getSession = async () => {
  return Effect.runPromise(
    Effect.tryPromise({
      try: async () => {
        const headersList = await headers();
        return auth.api.getSession({ headers: headersList });
      },
      catch: (e) => e,
    }),
  );
};

export const isAuthenticated = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(Effect.promise(() => getSession()));

      if (!session) {
        return false;
      }

      return true;
    }),
  );
};

export const getUserId = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(Effect.promise(() => getSession()));

      if (!session) {
        return yield* _(Effect.fail(new Error("User not authenticated")));
      }

      return session.user.id;
    }),
  );
};

export const isUserAdmin = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(Effect.promise(() => getSession()));

      if (!session) {
        return false;
      }

      return session.user.role === "admin";
    }),
  );
};

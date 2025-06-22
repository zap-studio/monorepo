"use server";
import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserId } from "@/zap/actions/auth/authenticated.action";

export const unsubscribeUser = async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = yield* _(
        Effect.tryPromise({
          try: () => getUserId(),
          catch: (e) => e,
        }),
      );

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .delete(pushNotifications)
              .where(eq(pushNotifications.userId, userId))
              .execute(),
          catch: (e) => e,
        }),
      );

      return { success: true };
    }),
  );
};

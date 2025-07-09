"use server";
import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { client } from "@/zap/lib/orpc/client";

export async function unsubscribeUserAction() {
  const effect = Effect.gen(function* (_) {
    const userId = yield* _(
      Effect.tryPromise({
        try: () => client.auth.getUserId(),
        catch: () => new Error("Failed to get user ID"),
      }),
    );

    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .delete(pushNotifications)
            .where(eq(pushNotifications.userId, userId))
            .execute(),
        catch: () => new Error("Failed to unsubscribe user"),
      }),
    );

    return { success: true };
  });

  return await Effect.runPromise(effect);
}

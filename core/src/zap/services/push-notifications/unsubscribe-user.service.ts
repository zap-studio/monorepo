import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";

export async function unsubscribeUserService() {
  const effect = Effect.gen(function* (_) {
    const userId = yield* _(
      Effect.tryPromise({
        try: () => getUserIdService(),
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

    return { success: true, message: "User unsubscribed successfully" };
  });

  return await Effect.runPromise(effect);
}

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function updateLastTimestampEmailSent(userId: string) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .update(user)
              .set({ lastEmailSentAt: new Date() })
              .where(eq(user.id, userId))
              .execute(),
          catch: (e) => e,
        }),
      );
    }),
  );
}

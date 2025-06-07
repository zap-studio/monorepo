"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const getUserIdFromMail = async (email: string) => {
  Effect.gen(function* (_) {
    const records = yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .select({ id: user.id })
            .from(user)
            .where(eq(user.email, email))
            .limit(1),
        catch: (e) => e,
      }),
    );

    const record = records[0];
    if (!record) {
      return yield* _(Effect.fail(new Error("User not found")));
    }

    return record.id;
  }).pipe(
    Effect.catchAll((error) => Effect.succeed({ success: false, error })),
  );
};

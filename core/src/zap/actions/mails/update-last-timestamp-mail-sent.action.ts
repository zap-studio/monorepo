"use server";
import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { user } from "@/db/schema";

interface UpdateLastTimestampMailSentActionProps {
  input: {
    userId: string;
  };
}

export async function updateLastTimestampMailSentAction({
  input,
}: UpdateLastTimestampMailSentActionProps) {
  const effect = Effect.gen(function* (_) {
    const userId = input.userId;

    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .update(user)
            .set({ lastEmailSentAt: new Date() })
            .where(eq(user.id, userId))
            .execute(),
        catch: () => new Error("Failed to update last timestamp mail sent"),
      }),
    );
  });

  return await Effect.runPromise(effect);
}

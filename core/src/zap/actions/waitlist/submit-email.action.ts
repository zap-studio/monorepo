"use server";
import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { waitlist } from "@/db/schema";

interface SubmitWaitlistEmailInput {
  email: string;
}

export async function submitWaitlistEmailAction({
  input,
}: {
  input: SubmitWaitlistEmailInput;
}) {
  const effect = Effect.gen(function* () {
    const email = input.email;

    const existing = yield* Effect.tryPromise({
      try: () =>
        db
          .select()
          .from(waitlist)
          .where(eq(waitlist.email, email))
          .limit(1)
          .execute(),
      catch: () => new Error("Failed to check existing email"),
    });

    if (existing.length > 0) {
      return yield* Effect.fail(new Error("Email already registered"));
    }

    yield* Effect.tryPromise({
      try: () => db.insert(waitlist).values({ email }).execute(),
      catch: () => new Error("Failed to save email"),
    });

    return {
      success: true,
      message: "Successfully joined the waitlist",
    };
  });

  const handledEffect = effect.pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
    ),
  );

  return await Effect.runPromise(handledEffect);
}

"use server";

import { eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { WaitlistSchema } from "@/zap/schemas/waitlist.schema";

export async function submitWaitlistEmail(formData: FormData) {
  const action = Effect.gen(function* () {
    const { email } = yield* Effect.try(() => {
      const rawEmail = formData.get("email");
      const emailValue = typeof rawEmail === "string" ? rawEmail.trim() : "";
      return WaitlistSchema.parse({ email: emailValue });
    });

    const existing = yield* Effect.tryPromise({
      try: async () =>
        await db
          .select()
          .from(waitlist)
          .where(eq(waitlist.email, email))
          .limit(1),
      catch: () => new Error("Failed to check existing email"),
    });

    if (existing.length > 0) {
      return yield* Effect.fail(new Error("Email already registered"));
    }

    yield* Effect.tryPromise({
      try: async () => await db.insert(waitlist).values({ email }),
      catch: () => new Error("Failed to save email"),
    });

    return {
      success: true,
      message: "Successfully joined the waitlist",
    };
  });

  const recoveredAction = action.pipe(
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

  return Effect.runPromise(recoveredAction);
}

import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import { user } from "@/zap/db/schema/auth.sql";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export async function canSendEmail(userId: string) {
  Effect.gen(function* (_) {
    const userRecords = yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .select({ lastEmailSentAt: user.lastEmailSentAt })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1),
        catch: (e) => e,
      }),
    );

    const userRecord = userRecords[0];
    if (!userRecord || !userRecord.lastEmailSentAt) {
      return { canSend: true };
    }

    const lastSent = new Date(userRecord.lastEmailSentAt);
    const now = new Date();
    const timeElapsed = (now.getTime() - lastSent.getTime()) / 1000; // in seconds

    if (timeElapsed < SETTINGS.MAIL.RATE_LIMIT_SECONDS) {
      return {
        canSend: false,
        timeLeft: Math.ceil(SETTINGS.MAIL.RATE_LIMIT_SECONDS - timeElapsed),
      };
    }

    return { canSend: true };
  });
}

export async function updateLastEmailSent(userId: string) {
  Effect.gen(function* (_) {
    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .update(user)
            .set({ lastEmailSentAt: new Date() })
            .where(eq(user.id, userId)),
        catch: (e) => e,
      }),
    );
  });
}

import { Effect } from "effect";

import { SETTINGS } from "@/data/settings";
import { getLastEmailSentAtQuery } from "@/zap/db/queries/emails.query";

export async function canSendEmail(userId: string) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userRecords = yield* _(
        Effect.tryPromise({
          try: () => getLastEmailSentAtQuery.execute({ userId }),
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
    }),
  );
}

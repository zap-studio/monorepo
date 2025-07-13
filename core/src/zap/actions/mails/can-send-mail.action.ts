"use server";
import "server-only";

import { Effect } from "effect";

import { SETTINGS } from "@/data/settings";
import { getLastMailSentAtQuery } from "@/zap/db/queries/emails.query";

interface CanSendMailActionProps {
  input: {
    userId: string;
  };
}

export async function canSendMailAction({ input }: CanSendMailActionProps) {
  const effect = Effect.gen(function* (_) {
    const userId = input.userId;

    const userRecords = yield* _(
      Effect.tryPromise({
        try: () => getLastMailSentAtQuery.execute({ userId }),
        catch: () => new Error("Failed to get last mail sent at"),
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

  return await Effect.runPromise(effect);
}

import "server-only";

import { SETTINGS } from "@/data/settings";
import { getLastMailSentAtQuery } from "@/zap/db/queries/emails.query";
import { NotFoundError } from "@/zap/lib/error-handling/errors";

interface CanSendMailServiceProps {
  input: {
    userId: string;
  };
}

export async function canSendMailService({ input }: CanSendMailServiceProps) {
  const userId = input.userId;

  const userRecords = await getLastMailSentAtQuery.execute({ userId });

  if (!userRecords.length) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  const userRecord = userRecords[0];
  if (!userRecord?.lastEmailSentAt) {
    return { canSend: true, timeLeft: 0 };
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

  return { canSend: true, timeLeft: 0 };
}

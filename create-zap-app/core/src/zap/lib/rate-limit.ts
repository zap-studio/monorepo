import { SETTINGS } from "@/data/settings";
import { db } from "@/db";
import { user } from "@/zap/db/schema/auth";
import { eq } from "drizzle-orm";

export async function canSendEmail(userId: string): Promise<{
  canSend: boolean;
  timeLeft?: number;
}> {
  const [userRecord] = await db
    .select({ lastEmailSentAt: user.lastEmailSentAt })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

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
}

export async function updateLastEmailSent(userId: string) {
  await db
    .update(user)
    .set({ lastEmailSentAt: new Date() })
    .where(eq(user.id, userId));
}

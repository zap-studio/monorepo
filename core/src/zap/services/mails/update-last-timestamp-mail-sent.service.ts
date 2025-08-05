import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

interface UpdateLastTimestampMailSentServiceProps {
  input: {
    userId: string;
  };
}

export async function updateLastTimestampMailSentService({
  input,
}: UpdateLastTimestampMailSentServiceProps) {
  try {
    const userId = input.userId;

    await db
      .update(user)
      .set({ lastEmailSentAt: new Date() })
      .where(eq(user.id, userId))
      .execute();
  } catch {
    throw new Error("Failed to update last timestamp mail sent");
  }
}

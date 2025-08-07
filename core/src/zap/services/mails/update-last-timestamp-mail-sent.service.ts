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
  const userId = input.userId;

  await db
    .update(user)
    .set({ lastEmailSentAt: new Date() })
    .where(eq(user.id, userId))
    .execute();

  return {
    message: "Last email sent timestamp updated successfully.",
  };
}

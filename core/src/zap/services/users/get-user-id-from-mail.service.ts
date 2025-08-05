import "server-only";

import { getUserIdFromMailQuery } from "@/zap/db/queries/emails.query";

interface GetUserIdFromMailServiceProps {
  input: {
    email: string;
  };
}

export async function getUserIdFromMailService({
  input,
}: GetUserIdFromMailServiceProps) {
  try {
    const email = input.email;

    const records = await getUserIdFromMailQuery.execute({ email });

    const record = records[0];
    if (!record) {
      throw new Error("User not found");
    }

    return record.userId;
  } catch {
    throw new Error("Failed to get user ID from mail");
  }
}

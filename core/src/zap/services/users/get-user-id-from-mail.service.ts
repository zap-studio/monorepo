import "server-only";

import { getUserIdFromMailQuery } from "@/zap/db/queries/emails.query";
import { NotFoundError } from "@/zap/lib/api/errors";

interface GetUserIdFromMailServiceProps {
  input: {
    email: string;
  };
}

export async function getUserIdFromMailService({
  input,
}: GetUserIdFromMailServiceProps) {
  const email = input.email;

  const records = await getUserIdFromMailQuery.execute({ email });

  const record = records[0];
  if (!record) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  return record.userId;
}

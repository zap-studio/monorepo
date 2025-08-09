import "server-only";

import { getUserIdFromMailQuery } from "@/zap/db/queries/emails.query";
import { NotFoundError } from "@/zap/lib/api/errors";

interface GetUserIdFromMailService {
  email: string;
}

export async function getUserIdFromMailService({
  email,
}: GetUserIdFromMailService) {
  const records = await getUserIdFromMailQuery.execute({ email });

  const record = records[0];
  if (!record) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  return record.userId;
}

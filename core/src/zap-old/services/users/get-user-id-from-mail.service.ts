import "server-only";

import { NotFoundError } from "@/zap/errors";
import { getUserIdFromMailQuery } from "@/zap/mails/db/queries";

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

import "server-only";

import { getNumberOfPeopleInWaitlistQuery } from "@/zap/db/queries/waitlist.query";
import { NotFoundError } from "@/zap/lib/error-handling/errors";

export async function getNumberOfPeopleInWaitlistService() {
  const result = await getNumberOfPeopleInWaitlistQuery.execute();

  if (!result.length) {
    throw new NotFoundError("No waitlist records found");
  }

  const record = result[0];
  return record.count;
}

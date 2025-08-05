import "server-only";

import { getNumberOfPeopleInWaitlistQuery } from "@/zap/db/queries/waitlist.query";

export async function getNumberOfPeopleInWaitlistService() {
  const result = await getNumberOfPeopleInWaitlistQuery.execute();

  const record = result[0];

  if (!record) {
    throw new Error("Error fetching waitlist count");
  }

  return record.count;
}

import "server-only";

import { count } from "drizzle-orm";

import { db } from "../../../db/providers/drizzle";
import { waitlist } from "../../../db/providers/drizzle/schema";

export const getNumberOfPeopleInWaitlistQuery = db
  .select({
    count: count(),
  })
  .from(waitlist)
  .prepare("getNumberOfPeopleInWaitlist");

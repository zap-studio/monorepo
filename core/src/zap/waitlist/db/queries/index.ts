import "server-only";

import { count } from "drizzle-orm";

import { db } from "@/db";
import { waitlist } from "@/db/schema";

export const getNumberOfPeopleInWaitlistQuery = db
  .select({
    count: count(),
  })
  .from(waitlist)
  .prepare("getNumberOfPeopleInWaitlist");

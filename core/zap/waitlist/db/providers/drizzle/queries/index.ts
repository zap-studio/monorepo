import "server-only";

import { count } from "drizzle-orm";

import { db } from "@/zap/db/providers/drizzle";

import { waitlist } from "../schema";

export const getNumberOfPeopleInWaitlistQuery = db
  .select({
    count: count(),
  })
  .from(waitlist)
  .prepare("getNumberOfPeopleInWaitlist");

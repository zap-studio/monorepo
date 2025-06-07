import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const getUserIdFromEmailQuery = db
  .select({ userId: user.id })
  .from(user)
  .where(eq(user.email, sql.placeholder("email")))
  .limit(1)
  .prepare("getUserIdFromEmail");

export const getLastEmailSentAtQuery = db
  .select({ lastEmailSentAt: user.lastEmailSentAt })
  .from(user)
  .where(eq(user.id, sql.placeholder("userId")))
  .limit(1)
  .prepare("getLastEmailSentAt");

import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/zap/db/providers/drizzle";

import { user } from "../schema";

export const getUserIdFromMailQuery = db
  .select({ userId: user.id })
  .from(user)
  .where(eq(user.email, sql.placeholder("email")))
  .limit(1)
  .prepare("getUserIdFromMail");

export const getLastMailSentAtQuery = db
  .select({ lastEmailSentAt: user.lastEmailSentAt })
  .from(user)
  .where(eq(user.id, sql.placeholder("userId")))
  .limit(1)
  .prepare("getLastMailSentAt");

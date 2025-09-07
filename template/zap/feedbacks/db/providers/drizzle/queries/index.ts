import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/zap/db/providers/drizzle";

import { feedback } from "../schema";

export const getFeedbackForUserQuery = db
  .select()
  .from(feedback)
  .where(eq(feedback.userId, sql.placeholder("userId")))
  .limit(1)
  .prepare("getFeedbackForUser");

export const getAverageRatingQuery = db
  .select({
    rating: feedback.rating,
  })
  .from(feedback)
  .prepare("getAverageRating");

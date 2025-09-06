import "server-only";

import { db } from "@/zap/db/providers/drizzle";

import {
  getAverageRatingQuery,
  getFeedbackForUserQuery,
} from "../db/providers/drizzle/queries";
import { feedback } from "../db/providers/drizzle/schema";
import { computeAverage } from "../utils";

export async function getAverageRatingService() {
  const feedbacks = await getAverageRatingQuery.execute();
  return computeAverage(feedbacks);
}

type GetUserFeedbackService = {
  userId: string;
};

export async function getUserFeedbackService({
  userId,
}: GetUserFeedbackService) {
  const existingFeedback = await getFeedbackForUserQuery.execute({ userId });

  if (!existingFeedback.length) {
    return null;
  }

  return existingFeedback[0];
}

type SubmitFeedbackService = {
  userId: string;
  rating: number;
  description?: string;
};

export async function submitFeedbackService({
  userId,
  rating,
  description,
}: SubmitFeedbackService) {
  await db
    .insert(feedback)
    .values({
      userId,
      rating,
      description: description || "",
      submittedAt: new Date(),
    })
    .execute();

  return { message: "Feedback submitted successfully." };
}

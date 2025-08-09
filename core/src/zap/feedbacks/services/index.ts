import "server-only";

import { db } from "@/db";
import { feedback } from "@/db/schema";
import {
  getAverageRatingQuery,
  getFeedbackForUserQuery,
} from "@/zap/feedbacks/db/queries";
import { computeAverage } from "@/zap/feedbacks/utils";

export async function getAverageRatingService() {
  const feedbacks = await getAverageRatingQuery.execute();
  return computeAverage(feedbacks);
}

interface GetUserFeedbackService {
  userId: string;
}

export async function getUserFeedbackService({
  userId,
}: GetUserFeedbackService) {
  const existingFeedback = await getFeedbackForUserQuery.execute({ userId });

  if (!existingFeedback.length) {
    return null;
  }

  return existingFeedback[0];
}

interface SubmitFeedbackService {
  userId: string;
  rating: number;
  description?: string;
}

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

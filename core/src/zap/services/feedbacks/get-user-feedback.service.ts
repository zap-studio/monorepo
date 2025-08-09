import "server-only";

import { getFeedbackForUserQuery } from "@/zap/db/queries/feedbacks.query";

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

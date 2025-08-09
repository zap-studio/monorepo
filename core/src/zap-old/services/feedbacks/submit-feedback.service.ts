import "server-only";

import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";

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
    .insert(feedbackTable)
    .values({
      userId,
      rating,
      description: description || "",
      submittedAt: new Date(),
    })
    .execute();

  return { message: "Feedback submitted successfully." };
}

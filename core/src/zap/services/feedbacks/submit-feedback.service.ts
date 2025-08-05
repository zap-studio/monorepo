import "server-only";

import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";

interface SubmitFeedbackContext {
  session: { user: { id: string } };
}
interface SubmitFeedbackInput {
  rating: number;
  description?: string;
}

export async function submitFeedbackService({
  context,
  input,
}: {
  context: SubmitFeedbackContext;
  input: SubmitFeedbackInput;
}) {
  const userId = context.session.user.id;

  await db
    .insert(feedbackTable)
    .values({
      userId,
      rating: input.rating,
      description: input.description || "",
      submittedAt: new Date(),
    })
    .execute();

  return { success: true };
}

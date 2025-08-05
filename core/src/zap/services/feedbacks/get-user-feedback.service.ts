import "server-only";

import { getFeedbackForUserQuery } from "@/zap/db/queries/feedbacks.query";

interface GetUserFeedbackContext {
  session: { user: { id: string } };
}

export async function getUserFeedbackService({
  context,
}: {
  context: GetUserFeedbackContext;
}) {
  try {
    const userId = context.session.user.id;

    const existingFeedback = await getFeedbackForUserQuery.execute({ userId });

    return existingFeedback.length > 0 ? existingFeedback[0] : null;
  } catch {
    throw new Error("Failed to get user feedback");
  }
}

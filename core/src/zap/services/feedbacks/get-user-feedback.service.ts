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
  const userId = context.session.user.id;

  const existingFeedback = await getFeedbackForUserQuery.execute({ userId });

  if (!existingFeedback.length) {
    return null;
  }

  return existingFeedback[0];
}

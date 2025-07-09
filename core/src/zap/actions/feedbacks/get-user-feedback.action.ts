"use server";
import "server-only";

import { Effect } from "effect";

import { getFeedbackForUserQuery } from "@/zap/db/queries/feedbacks.query";

interface GetUserFeedbackContext {
  session: { user: { id: string } };
}

export async function getUserFeedbackAction({
  context,
}: {
  context: GetUserFeedbackContext;
}) {
  const effect = Effect.gen(function* (_) {
    const userId = context.session.user.id;

    const existingFeedback = yield* _(
      Effect.tryPromise({
        try: () => getFeedbackForUserQuery.execute({ userId }),
        catch: () => new Error("Failed to get user feedback"),
      }),
    );

    return existingFeedback.length > 0 ? existingFeedback[0] : null;
  });

  return await Effect.runPromise(effect);
}

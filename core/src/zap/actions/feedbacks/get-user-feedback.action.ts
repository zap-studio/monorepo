import { Effect } from "effect";

import { getFeedbackForUserQuery } from "@/zap/db/queries/feedbacks.query";

interface GetUserFeedbackContext {
  session: { user: { id: string } };
}

export const getUserFeedbackAction = async ({
  context,
}: {
  context: GetUserFeedbackContext;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;

      const existingFeedback = yield* _(
        Effect.tryPromise({
          try: () => getFeedbackForUserQuery.execute({ userId }),
          catch: (e) => e,
        }),
      );

      return existingFeedback.length > 0 ? existingFeedback[0] : null;
    }),
  );
};

import { Effect } from "effect";

import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";

interface SubmitFeedbackContext {
  session: { user: { id: string } };
}
interface SubmitFeedbackInput {
  rating: number;
  description?: string;
}

export const submitFeedbackAction = async ({
  context,
  input,
}: {
  context: SubmitFeedbackContext;
  input: SubmitFeedbackInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(feedbackTable)
              .values({
                userId,
                rating: input.rating,
                description: input.description || "",
                submittedAt: new Date(),
              })
              .execute(),
          catch: (e) => e,
        }),
      );

      return { success: true };
    }),
  );
};

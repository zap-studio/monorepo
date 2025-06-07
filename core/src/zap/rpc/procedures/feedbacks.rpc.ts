import { authMiddleware, base } from "@/rpc/middlewares";
import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";
import { FeedbackSchema } from "@/zap/schemas/feedback.schema";
import { Effect } from "effect";
import {
  getAverageRatingQuery,
  getFeedbackForUserQuery,
} from "@/zap/db/queries/feedbacks.query";

const submit = base
  .use(authMiddleware)
  .input(FeedbackSchema)
  .handler(async ({ context, input }) => {
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
  });

const getUserFeedback = base
  .use(authMiddleware)
  .handler(async ({ context }) => {
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
  });

const getAverageRating = base.handler(async () => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const feedbacks = yield* _(
        Effect.tryPromise({
          try: () => getAverageRatingQuery.execute(),
          catch: (e) => e,
        }),
      );

      if (feedbacks.length === 0) {
        return {
          averageRating: 5,
          totalFeedbacks: 1,
        };
      }

      const totalRating = feedbacks.reduce((acc, feedback) => {
        return acc + feedback.rating;
      }, 0);

      const averageRatingOnTen = totalRating / feedbacks.length;
      const averageRating = (averageRatingOnTen / 10) * 5;

      return { averageRating, totalFeedbacks: feedbacks.length };
    }),
  );
});

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

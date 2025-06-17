import { Effect } from "effect";

import { getAverageRatingQuery } from "@/zap/db/queries/feedbacks.query";

export const getAverageRatingAction = async () => {
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
};

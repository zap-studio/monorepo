"use server";
import "server-only";

import { Effect } from "effect";

import { getAverageRatingQuery } from "@/zap/db/queries/feedbacks.query";

export async function getAverageRatingAction() {
  const effect = Effect.gen(function* (_) {
    const feedbacks = yield* _(
      Effect.tryPromise({
        try: () => getAverageRatingQuery.execute(),
        catch: () => new Error("Failed to get average rating"),
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
  }).pipe(
    Effect.catchAll(() =>
      Effect.succeed({ averageRating: 5, totalFeedbacks: 1 }),
    ),
  );

  return await Effect.runPromise(effect);
}

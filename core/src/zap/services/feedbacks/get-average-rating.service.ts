import "server-only";

import { Effect, pipe } from "effect";

import { DatabaseFetchError } from "@/lib/effect";
import { getAverageRatingQuery } from "@/zap/db/queries/feedbacks.query";

const fetchFeedbacks = Effect.tryPromise({
  try: () => getAverageRatingQuery.execute(),
  catch: () => new DatabaseFetchError({ message: "Failed to fetch feedbacks" }),
});

function computeAverage(feedbacks: { rating: number }[]) {
  const totalFeedbacks = feedbacks.length;

  if (totalFeedbacks === 0) {
    return { averageRating: 0, totalFeedbacks };
  }

  const totalRating = feedbacks.reduce((sum, { rating }) => sum + rating, 0);
  const averageRating = (totalRating / totalFeedbacks / 10) * 5;

  return { averageRating, totalFeedbacks };
}

export async function getAverageRatingService() {
  const program = pipe(
    fetchFeedbacks,
    Effect.map(computeAverage),
    Effect.catchAll(() =>
      Effect.succeed({ averageRating: 0, totalFeedbacks: 0 }),
    ),
  );

  return await Effect.runPromise(program);
}

import "server-only";

import { getAverageRatingQuery } from "@/zap/db/queries/feedbacks.query";

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
  const feedbacks = await getAverageRatingQuery.execute();
  return computeAverage(feedbacks);
}

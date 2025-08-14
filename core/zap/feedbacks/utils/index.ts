export function computeAverage(feedbacks: { rating: number }[]) {
  const totalFeedbacks = feedbacks.length;

  if (totalFeedbacks === 0) {
    return { averageRating: 0, totalFeedbacks };
  }

  const totalRating = feedbacks.reduce((sum, { rating }) => sum + rating, 0);
  const averageRating = (totalRating / totalFeedbacks / 10) * 5;

  return { averageRating, totalFeedbacks };
}

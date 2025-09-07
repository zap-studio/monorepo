import { ZAP_FEEDBACKS_CONFIG } from "../zap.plugin.config";

export function computeAverage(feedbacks: { rating: number }[]) {
  const totalFeedbacks = feedbacks.length;

  if (totalFeedbacks === 0) {
    return { averageRating: 0, totalFeedbacks };
  }

  const totalRating = feedbacks.reduce((sum, { rating }) => sum + rating, 0);
  const averageRating =
    (totalRating / totalFeedbacks / ZAP_FEEDBACKS_CONFIG.MAX_RATING) *
    ZAP_FEEDBACKS_CONFIG.TARGET_SCALE;

  return { averageRating, totalFeedbacks };
}

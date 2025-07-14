import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { getAverageRatingAction } from "@/zap/actions/feedbacks/get-average-rating.action";
import { getUserFeedbackAction } from "@/zap/actions/feedbacks/get-user-feedback.action";
import { submitFeedbackAction } from "@/zap/actions/feedbacks/submit-feedback.action";
import { FeedbackSchema } from "@/zap/schemas/feedback.schema";

const submit = base
  .use(authMiddleware)
  .input(FeedbackSchema)
  .handler(submitFeedbackAction);

const getUserFeedback = base.use(authMiddleware).handler(getUserFeedbackAction);

const getAverageRating = base.handler(getAverageRatingAction);

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

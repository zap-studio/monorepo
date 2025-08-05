import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/error-handling/handlers";
import { FeedbackSchema } from "@/zap/schemas/feedback.schema";
import { getAverageRatingService } from "@/zap/services/feedbacks/get-average-rating.service";
import { getUserFeedbackService } from "@/zap/services/feedbacks/get-user-feedback.service";
import { submitFeedbackService } from "@/zap/services/feedbacks/submit-feedback.service";

const submit = base
  .use(authMiddleware)
  .input(FeedbackSchema)
  .handler(withRpcHandler(submitFeedbackService));

const getUserFeedback = base
  .use(authMiddleware)
  .handler(withRpcHandler(getUserFeedbackService));

const getAverageRating = base.handler(withRpcHandler(getAverageRatingService));

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

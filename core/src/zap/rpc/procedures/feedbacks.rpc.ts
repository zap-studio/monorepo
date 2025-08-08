import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import { InputFeedbackSchema } from "@/zap/schemas/feedback.schema";
import { getAverageRatingService } from "@/zap/services/feedbacks/get-average-rating.service";
import { getUserFeedbackService } from "@/zap/services/feedbacks/get-user-feedback.service";
import { submitFeedbackService } from "@/zap/services/feedbacks/submit-feedback.service";

const submit = base
  .use(authMiddleware)
  .input(InputFeedbackSchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await submitFeedbackService({
        userId: context.session.session.userId,
        ...input,
      });
    }),
  );

const getUserFeedback = base.use(authMiddleware).handler(
  withRpcHandler(async ({ context }) => {
    return await getUserFeedbackService({
      userId: context.session.session.userId,
    });
  }),
);

const getAverageRating = base.handler(withRpcHandler(getAverageRatingService));

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

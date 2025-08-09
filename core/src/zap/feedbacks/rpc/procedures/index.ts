import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import { InputFeedbackSchema } from "@/zap/feedbacks/schemas";
import {
  getAverageRatingService,
  getUserFeedbackService,
  submitFeedbackService,
} from "@/zap/feedbacks/services";

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

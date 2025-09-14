import "server-only";

import { getServerPlugin } from "@/lib/zap.server";
import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import { InputFeedbackSchema } from "../../schemas";
import {
  getAverageRatingService,
  getUserFeedbackService,
  submitFeedbackService,
} from "../../services";

const config = getServerPlugin("auth").config ?? {};

const submit = base
  .use($authMiddleware(config))
  .input(InputFeedbackSchema)
  .handler(
    withRpcHandler(async ({ input, context }) => {
      return await submitFeedbackService({
        userId: context.session.session.userId,
        ...input,
      });
    })
  );

const getUserFeedback = base.use($authMiddleware(config)).handler(
  withRpcHandler(async ({ context }) => {
    return await getUserFeedbackService({
      userId: context.session.session.userId,
    });
  })
);

const getAverageRating = base.handler(withRpcHandler(getAverageRatingService));

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

import "server-only";

import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { InputFeedbackSchema } from "../../schemas";
import {
  getAverageRatingService,
  getUserFeedbackService,
  submitFeedbackService,
} from "../../services";

const $submit = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputFeedbackSchema)
    .handler(
      withRpcHandler(
        async ({ input, context }) =>
          await submitFeedbackService({
            userId: context.session.session.userId,
            ...input,
          })
      )
    );

const $getUserFeedback = (authConfig: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(authConfig)).handler(
    withRpcHandler(
      async ({ context }) =>
        await getUserFeedbackService({
          userId: context.session.session.userId,
        })
    )
  );

const getAverageRating = base.handler(withRpcHandler(getAverageRatingService));

export const feedbacks = (authConfig: Partial<AuthServerPluginConfig>) => ({
  submit: $submit(authConfig),
  getUserFeedback: $getUserFeedback(authConfig),
  getAverageRating,
});

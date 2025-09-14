import "server-only";

import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import {
  InputCanSendMailSchema,
  InputSendForgotPasswordMailSchema,
  InputSendMagicLinkMailSchema,
  InputSendMailSchema,
  InputSendVerificationMailSchema,
  InputUpdateLastTimestampMailSentSchema,
} from "../../schemas";
import {
  canSendMailService,
  sendForgotPasswordMailService,
  sendMagicLinkMailService,
  sendMailService,
  sendVerificationMailService,
  updateLastTimestampMailSentService,
} from "../../services";

const $canSendMail = (authConfig: Partial<AuthServerPluginConfig>) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputCanSendMailSchema)
    .handler(
      withRpcHandler(async ({ context }) => {
        return await canSendMailService({
          userId: context.session.session.userId,
        });
      })
    );

const $updateLastTimestampMailSent = (
  authConfig: Partial<AuthServerPluginConfig>
) =>
  base
    .use($authMiddleware(authConfig))
    .input(InputUpdateLastTimestampMailSentSchema)
    .handler(
      withRpcHandler(async ({ context }) => {
        return await updateLastTimestampMailSentService({
          userId: context.session.session.userId,
        });
      })
    );

const sendForgotPasswordMail = base
  .input(InputSendForgotPasswordMailSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await sendForgotPasswordMailService({
        ...input,
      });
    })
  );

const sendVerificationMail = base
  .input(InputSendVerificationMailSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await sendVerificationMailService({
        ...input,
      });
    })
  );

const sendMagicLinkMail = base.input(InputSendMagicLinkMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await sendMagicLinkMailService({
      ...input,
    });
  })
);

const sendMail = base.input(InputSendMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await sendMailService({
      ...input,
    });
  })
);

export const mails = (authConfig: Partial<AuthServerPluginConfig>) => ({
  sendForgotPasswordMail,
  sendVerificationMail,
  sendMagicLinkMail,
  sendMail,
  canSendMail: $canSendMail(authConfig),
  updateLastTimestampMailSent: $updateLastTimestampMailSent(authConfig),
});

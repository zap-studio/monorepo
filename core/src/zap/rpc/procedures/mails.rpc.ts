import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import {
  InputCanSendMailSchema,
  InputSendForgotPasswordMailSchema,
  InputSendMagicLinkMailSchema,
  InputSendMailSchema,
  InputSendVerificationMailSchema,
  InputUpdateLastTimestampMailSentSchema,
} from "@/zap/schemas/mails.schema";
import { canSendMailService } from "@/zap/services/mails/can-send-mail.service";
import { sendForgotPasswordMailService } from "@/zap/services/mails/send-forgot-password-mail.service";
import { sendMagicLinkMailService } from "@/zap/services/mails/send-magic-link-mail.service";
import { sendMailService } from "@/zap/services/mails/send-mail.service";
import { sendVerificationMailService } from "@/zap/services/mails/send-verification-mail.service";
import { updateLastTimestampMailSentService } from "@/zap/services/mails/update-last-timestamp-mail-sent.service";

const canSendMail = base
  .use(authMiddleware)
  .input(InputCanSendMailSchema)
  .handler(
    withRpcHandler(async ({ context }) => {
      return await canSendMailService({
        userId: context.session.session.userId,
      });
    }),
  );

const updateLastTimestampMailSent = base
  .use(authMiddleware)
  .input(InputUpdateLastTimestampMailSentSchema)
  .handler(
    withRpcHandler(async ({ context }) => {
      return await updateLastTimestampMailSentService({
        userId: context.session.session.userId,
      });
    }),
  );

const sendForgotPasswordMail = base
  .input(InputSendForgotPasswordMailSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await sendForgotPasswordMailService({
        ...input,
      });
    }),
  );

const sendVerificationMail = base
  .input(InputSendVerificationMailSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await sendVerificationMailService({
        ...input,
      });
    }),
  );

const sendMagicLinkMail = base.input(InputSendMagicLinkMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await sendMagicLinkMailService({
      ...input,
    });
  }),
);

const sendMail = base.input(InputSendMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await sendMailService({
      ...input,
    });
  }),
);

export const mails = {
  sendForgotPasswordMail,
  sendVerificationMail,
  sendMagicLinkMail,
  sendMail,
  canSendMail,
  updateLastTimestampMailSent,
};

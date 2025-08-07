import "server-only";

import { base } from "@/rpc/middlewares";
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
  .input(InputCanSendMailSchema)
  .handler(withRpcHandler(canSendMailService));

const updateLastTimestampMailSent = base
  .input(InputUpdateLastTimestampMailSentSchema)
  .handler(withRpcHandler(updateLastTimestampMailSentService));

const sendForgotPasswordMail = base
  .input(InputSendForgotPasswordMailSchema)
  .handler(withRpcHandler(sendForgotPasswordMailService));

const sendVerificationMail = base
  .input(InputSendVerificationMailSchema)
  .handler(withRpcHandler(sendVerificationMailService));

const sendMagicLinkMail = base
  .input(InputSendMagicLinkMailSchema)
  .handler(withRpcHandler(sendMagicLinkMailService));

const sendMail = base
  .input(InputSendMailSchema)
  .handler(withRpcHandler(sendMailService));

export const mails = {
  sendForgotPasswordMail,
  sendVerificationMail,
  sendMagicLinkMail,
  sendMail,
  canSendMail,
  updateLastTimestampMailSent,
};

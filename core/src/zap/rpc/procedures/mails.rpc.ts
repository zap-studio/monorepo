import "server-only";

import { base } from "@/rpc/middlewares";
import { canSendMailAction } from "@/zap/actions/mails/can-send-mail.action";
import { sendForgotPasswordMailAction } from "@/zap/actions/mails/send-forgot-password-mail.action";
import { sendMagicLinkMailAction } from "@/zap/actions/mails/send-magic-link-mail.action";
import { sendMailAction } from "@/zap/actions/mails/send-mail.action";
import { sendVerificationMailAction } from "@/zap/actions/mails/send-verification-mail.action";
import { updateLastTimestampMailSentAction } from "@/zap/actions/mails/update-last-timestamp-mail-sent.action";
import {
  InputCanSendMailSchema,
  InputSendForgotPasswordMailSchema,
  InputSendMagicLinkMailSchema,
  InputSendMailSchema,
  InputSendVerificationMailSchema,
  InputUpdateLastTimestampMailSentSchema,
} from "@/zap/schemas/mails.schema";

const canSendMail = base
  .input(InputCanSendMailSchema)
  .handler(canSendMailAction);
const updateLastTimestampMailSent = base
  .input(InputUpdateLastTimestampMailSentSchema)
  .handler(updateLastTimestampMailSentAction);
const sendForgotPasswordMail = base
  .input(InputSendForgotPasswordMailSchema)
  .handler(sendForgotPasswordMailAction);
const sendVerificationMail = base
  .input(InputSendVerificationMailSchema)
  .handler(sendVerificationMailAction);
const sendMagicLinkMail = base
  .input(InputSendMagicLinkMailSchema)
  .handler(sendMagicLinkMailAction);
const sendMail = base.input(InputSendMailSchema).handler(sendMailAction);

export const mails = {
  sendForgotPasswordMail,
  sendVerificationMail,
  sendMagicLinkMail,
  sendMail,
  canSendMail,
  updateLastTimestampMailSent,
};

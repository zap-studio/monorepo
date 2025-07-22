import "server-only";

import { base } from "@/rpc/middlewares";
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
  .handler(canSendMailService);
const updateLastTimestampMailSent = base
  .input(InputUpdateLastTimestampMailSentSchema)
  .handler(updateLastTimestampMailSentService);
const sendForgotPasswordMail = base
  .input(InputSendForgotPasswordMailSchema)
  .handler(sendForgotPasswordMailService);
const sendVerificationMail = base
  .input(InputSendVerificationMailSchema)
  .handler(sendVerificationMailService);
const sendMagicLinkMail = base
  .input(InputSendMagicLinkMailSchema)
  .handler(sendMagicLinkMailService);
const sendMail = base.input(InputSendMailSchema).handler(sendMailService);

export const mails = {
  sendForgotPasswordMail,
  sendVerificationMail,
  sendMagicLinkMail,
  sendMail,
  canSendMail,
  updateLastTimestampMailSent,
};

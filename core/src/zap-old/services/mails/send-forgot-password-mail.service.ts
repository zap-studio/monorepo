import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { ForgotPasswordMail } from "@/zap/components/mails/forgot-password.mail";
import { MailError } from "@/zap/lib/api/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface ForgotPasswordMailService {
  subject: string;
  recipients: string[];
  url: string;
}

export async function sendForgotPasswordMailService({
  subject,
  recipients,
  url,
}: ForgotPasswordMailService) {
  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: ForgotPasswordMail({ url }),
  });

  if (error) {
    throw new MailError("Failed to send forgot password mail", error);
  }

  return data;
}

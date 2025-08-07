import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { ForgotPasswordMail } from "@/zap/components/mails/forgot-password.mail";
import { MailError } from "@/zap/lib/api/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface ForgotPasswordMailProps {
  input: { subject: string; recipients: string[]; url: string };
}

export async function sendForgotPasswordMailService({
  input,
}: ForgotPasswordMailProps) {
  const subject = input.subject;
  const recipients = input.recipients;
  const url = input.url;

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

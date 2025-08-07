import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { VerificationMail } from "@/zap/components/mails/verification.mail";
import { MailError } from "@/zap/lib/api/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

interface SendVerificationMailProps {
  input: { subject: string; recipients: string[]; url: string };
}

export async function sendVerificationMailService({
  input,
}: SendVerificationMailProps) {
  const subject = input.subject;
  const recipients = input.recipients;
  const url = input.url;

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: VerificationMail({ url }),
  });

  if (error) {
    throw new MailError(
      `Failed to send verification mail: ${error.message}`,
      error,
    );
  }

  return data;
}

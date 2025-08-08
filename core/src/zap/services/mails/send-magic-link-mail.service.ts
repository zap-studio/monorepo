import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MagicLinkMail } from "@/zap/components/mails/magic-link.mail";
import { MailError } from "@/zap/lib/api/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMagicLinkMailService {
  subject: string;
  recipients: string[];
  url: string;
}

export async function sendMagicLinkMailService({
  subject,
  recipients,
  url,
}: SendMagicLinkMailService) {
  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: MagicLinkMail({ url }),
  });

  if (error) {
    throw new MailError(
      `Failed to send magic link mail: ${error.message}`,
      error,
    );
  }

  return data;
}

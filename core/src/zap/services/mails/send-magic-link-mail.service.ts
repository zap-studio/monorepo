import "server-only";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MagicLinkMail } from "@/zap/components/mails/magic-link.mail";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMagicLinkMailProps {
  input: { subject: string; recipients: string[]; url: string };
}

export async function sendMagicLinkMailService({
  input,
}: SendMagicLinkMailProps) {
  try {
    const subject = input.subject;
    const recipients = input.recipients;
    const url = input.url;

    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      react: MagicLinkMail({ url }),
    });

    if (error) {
      throw error;
    }

    return data;
  } catch {
    throw new Error("Failed to send magic link mail");
  }
}

import "server-only";

import type { JSX } from "react";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MailError } from "@/zap/lib/error-handling/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMailProps {
  input: { subject: string; recipients: string[]; react?: JSX.Element };
}

export async function sendMailService({ input }: SendMailProps) {
  const subject = input.subject;
  const recipients = input.recipients;
  const react = input.react;

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react,
  });

  if (error) {
    throw new MailError(`Failed to send mail: ${error.message}`, error);
  }

  return data;
}

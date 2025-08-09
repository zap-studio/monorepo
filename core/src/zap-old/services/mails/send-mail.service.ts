import "server-only";

import type { JSX } from "react";

import { ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { MailError } from "@/zap/lib/api/errors";
import { resend } from "@/zap/lib/resend/server";

const from = ZAP_DEFAULT_SETTINGS.MAIL.FROM;

export interface SendMailService {
  subject: string;
  recipients: string[];
  react?: JSX.Element;
}

export async function sendMailService({
  subject,
  recipients,
  react,
}: SendMailService) {
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

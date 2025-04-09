"use server";

import { resend } from "@/lib/resend";
import { ForgotPasswordEmail } from "@/components/emails/forgot-password";

interface ForgotPasswordEmailProps {
  subject: string;
  recipients: string[];
  url: string;
}

export const sendForgotPasswordMail = async ({
  subject,
  recipients,
  url,
}: ForgotPasswordEmailProps) => {
  const { data, error } = await resend.emails.send({
    from: "Zap.ts <hello@mail.alexandretrotel.org>",
    to: recipients,
    subject,
    react: ForgotPasswordEmail({ url }),
  });

  if (error) {
    throw error;
  }

  return data;
};

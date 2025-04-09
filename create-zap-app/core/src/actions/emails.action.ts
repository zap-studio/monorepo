"use server";

import { resend } from "@/lib/resend";
import { ForgotPasswordEmail } from "@/components/emails/forgot-password";
import { VerificationEmail } from "@/components/emails/verification";
import { JSX } from "react";

const from = "Zap.ts <hello@mail.alexandretrotel.org>";

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
    from,
    to: recipients,
    subject,
    react: ForgotPasswordEmail({ url }),
  });

  if (error) {
    throw error;
  }

  return data;
};

export const sendVerificationEmail = async ({
  subject,
  recipients,
  url,
}: ForgotPasswordEmailProps) => {
  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: VerificationEmail({ url }),
  });

  if (error) {
    throw error;
  }

  return data;
};

interface SendMailProps {
  subject: string;
  recipients: string[];
  react?: JSX.Element;
}

export async function sendMail({ subject, recipients, react }: SendMailProps) {
  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react,
  });

  if (error) {
    throw error;
  }

  return data;
}

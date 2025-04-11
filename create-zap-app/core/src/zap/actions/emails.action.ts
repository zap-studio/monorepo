"use server";

import { resend } from "@/zap/lib/resend";
import { ForgotPasswordEmail } from "@/zap/components/emails/forgot-password";
import { VerificationEmail } from "@/zap/components/emails/verification";
import { JSX } from "react";
import { MagicLinkEmail } from "@/zap/components/emails/magic-link";

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

export const sendMagicLinkEmail = async ({
  subject,
  recipients,
  url,
}: {
  subject: string;
  recipients: string[];
  url: string;
}) => {
  const from = "Zap.ts <hello@mail.alexandretrotel.org>";

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject,
    react: MagicLinkEmail({ url }),
  });

  if (error) {
    throw error;
  }

  return data;
};

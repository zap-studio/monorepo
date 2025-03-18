"use server";

import { resend } from "@/lib/resend";
import EmailTemplate from "@/components/emails/template";

// TODO: change the settings below especially the from email address
export const sendMail = async (subject: string, recipients: string[]) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: recipients,
    subject,
    react: EmailTemplate(),
  });

  if (error) {
    throw error;
  }

  return data;
};

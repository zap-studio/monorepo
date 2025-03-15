"use server";

import { Resend } from "resend";
import EmailTemplate from "@/components/emails/template";

const resend = new Resend(process.env.RESEND_API_KEY!);

// TODO: change the settings below
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

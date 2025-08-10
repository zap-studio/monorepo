import "server-only";

import { eq } from "drizzle-orm";
import React from "react";

import { getLastMailSentAtQuery } from "@/zap/auth/db/queries";
import { isUserAdminService } from "@/zap/auth/services";
import { db } from "@/zap/db/providers/drizzle";
import { user } from "@/zap/db/providers/drizzle/schema";
import { MailError, NotFoundError, UnauthorizedError } from "@/zap/errors";

import { resend } from "../providers/resend/server";
import {
  ForgotPasswordMail,
  MagicLinkMail,
  VerificationMail,
} from "../templates";
import { ZAP_MAILS_CONFIG } from "../zap.plugin.config";

const FROM_EMAIL = ZAP_MAILS_CONFIG.FROM;

interface MailServiceParams {
  subject: string;
  recipients: string[];
  url?: string;
  react?: React.JSX.Element;
}

export async function sendMailService({
  subject,
  recipients,
  react,
}: MailServiceParams) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipients,
    subject,
    react,
  });

  if (error) {
    throw new MailError(`Failed to send mail: ${error.message}`, error);
  }

  return data;
}

export async function canSendMailService({ userId }: { userId: string }) {
  const [userRecord] = await getLastMailSentAtQuery.execute({ userId });

  if (!userRecord) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  if (!userRecord.lastEmailSentAt) {
    return { canSend: true, timeLeft: 0 };
  }

  const lastSent = new Date(userRecord.lastEmailSentAt);
  const timeElapsed = (Date.now() - lastSent.getTime()) / 1000; // in seconds
  const rateLimit = ZAP_MAILS_CONFIG.RATE_LIMIT_SECONDS;

  return {
    canSend: timeElapsed >= rateLimit,
    timeLeft: timeElapsed < rateLimit ? Math.ceil(rateLimit - timeElapsed) : 0,
  };
}

export async function sendAdminEmailService({
  subject,
  recipients,
}: MailServiceParams) {
  if (!(await isUserAdminService())) {
    throw new UnauthorizedError("Admin access required");
  }

  return sendMailService({ subject, recipients });
}

export async function sendForgotPasswordMailService({
  subject,
  recipients,
  url,
}: MailServiceParams) {
  return sendMailService({
    subject,
    recipients,
    react: url ? ForgotPasswordMail({ url }) : undefined,
  });
}

export async function sendMagicLinkMailService({
  subject,
  recipients,
  url,
}: MailServiceParams) {
  return sendMailService({
    subject,
    recipients,
    react: url ? MagicLinkMail({ url }) : undefined,
  });
}

export async function sendVerificationMailService({
  subject,
  recipients,
  url,
}: MailServiceParams) {
  return sendMailService({
    subject,
    recipients,
    react: url ? VerificationMail({ url }) : undefined,
  });
}

export async function updateLastTimestampMailSentService({
  userId,
}: {
  userId: string;
}) {
  await db
    .update(user)
    .set({ lastEmailSentAt: new Date() })
    .where(eq(user.id, userId));

  return { message: "Last email sent timestamp updated successfully" };
}

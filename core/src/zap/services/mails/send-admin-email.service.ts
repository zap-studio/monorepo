import "server-only";

import { UnauthorizedError } from "@/zap/lib/api/errors";
import { orpcServer } from "@/zap/lib/orpc/server";
import { sendMailService } from "@/zap/services/mails/send-mail.service";

interface SendAdminEmailInput {
  subject: string;
  recipients: string[];
}

export interface SendAdminEmailProps {
  input: SendAdminEmailInput;
}

export async function sendAdminEmailService({ input }: SendAdminEmailProps) {
  const isAdmin = await orpcServer.auth.isUserAdmin();

  if (!isAdmin) {
    throw new UnauthorizedError("Admin access required");
  }

  return await sendMailService({ input });
}

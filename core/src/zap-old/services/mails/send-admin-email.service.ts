import "server-only";

import { UnauthorizedError } from "@/zap/lib/api/errors";
import { isUserAdminService } from "@/zap/services/auth/is-user-admin.service";
import { sendMailService } from "@/zap/services/mails/send-mail.service";

interface SendAdminEmailService {
  subject: string;
  recipients: string[];
}

export async function sendAdminEmailService({
  subject,
  recipients,
}: SendAdminEmailService) {
  const isAdmin = await isUserAdminService();

  if (!isAdmin) {
    throw new UnauthorizedError("Admin access required");
  }

  return await sendMailService({ subject, recipients });
}

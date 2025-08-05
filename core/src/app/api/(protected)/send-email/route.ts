import "server-only";

import { z } from "zod";

import { parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { sendEmail } from "@/zap/services/email.service";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export const POST = withApiHandler(async (req: Request) => {
  const { subject, recipients } = await parseRequestBody(req, SendMailSchema);
  const data = await sendEmail({ subject, recipients });
  return Response.json(data, { status: 200 });
});

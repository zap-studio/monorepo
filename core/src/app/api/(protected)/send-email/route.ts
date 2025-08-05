import "server-only";

import { z } from "zod";

import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { orpcServer } from "@/zap/lib/orpc/server";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export const POST = withApiHandler(async (req: Request) => {
  const isAdmin = await orpcServer.auth.isUserAdmin();

  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = SendMailSchema.parse(unvalidatedBody);

  const data = await orpcServer.mails.sendMail({
    subject: body.subject,
    recipients: body.recipients,
  });

  return Response.json(data, { status: 200 });
});

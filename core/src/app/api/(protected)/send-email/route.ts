import "server-only";

import { z } from "zod";

import { orpcServer } from "@/zap/lib/orpc/server";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const isAdmin = await orpcServer.auth.isUserAdmin();

    if (!isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let unvalidatedBody;
    try {
      unvalidatedBody = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 500 });
    }

    const body = SendMailSchema.parse(unvalidatedBody);

    let data;
    try {
      data = await orpcServer.mails.sendMail({
        subject: body.subject,
        recipients: body.recipients,
      });
    } catch {
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}

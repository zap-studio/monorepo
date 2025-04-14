import { isUserAdmin } from "@/zap/actions/authenticated.action";
import { sendMail } from "@/zap/actions/emails.action";
import { z } from "zod";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unvalidatedBody = await req.json();
    const body = SendMailSchema.parse(unvalidatedBody);

    const data = await sendMail({
      subject: body.subject,
      recipients: body.recipients,
    });

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}

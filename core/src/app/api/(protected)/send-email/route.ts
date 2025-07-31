import "server-only";

import { Effect } from "effect";
import { z } from "zod";

import { orpcServer } from "@/zap/lib/orpc/server";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export async function POST(req: Request) {
  const effect = Effect.gen(function* (_) {
    const isAdmin = yield* _(
      Effect.tryPromise({
        try: () => orpcServer.auth.isUserAdmin(),
        catch: () => false,
      }),
    );

    if (!isAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unvalidatedBody = yield* _(
      Effect.tryPromise({
        try: () => req.json(),
        catch: () => new Error("Invalid JSON body"),
      }),
    );

    const body = SendMailSchema.parse(unvalidatedBody);

    const data = yield* _(
      Effect.tryPromise({
        try: () =>
          orpcServer.mails.sendMail({
            subject: body.subject,
            recipients: body.recipients,
          }),
        catch: () => new Error("Failed to send email"),
      }),
    );

    return Response.json(data, { status: 200 });
  }).pipe(
    Effect.catchAll((err) =>
      Effect.succeed(
        Response.json(
          {
            error:
              err && typeof err === "object" && "message" in err
                ? (err as Error).message
                : "Internal error",
          },
          { status: 500 },
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}

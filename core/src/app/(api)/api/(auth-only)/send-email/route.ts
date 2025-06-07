import { isUserAdmin } from "@/zap/actions/authenticated.action";
import { sendMail } from "@/zap/actions/emails.action";
import { z } from "zod/v4";
import { Effect } from "effect";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export async function POST(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const isAdmin = yield* _(
        Effect.tryPromise({
          try: () => isUserAdmin(),
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
            sendMail({
              subject: body.subject,
              recipients: body.recipients,
            }),
          catch: (error) => error,
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
    ),
  );
}

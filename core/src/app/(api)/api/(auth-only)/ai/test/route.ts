import { getModel } from "@/zap/lib/ai/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { generateText } from "ai";
import { z } from "zod/v4";
import { Effect } from "effect";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

export async function POST(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: req.headers }),
          catch: () => null,
        }),
      );

      if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const unvalidatedBody = yield* _(
        Effect.tryPromise({
          try: () => req.json(),
          catch: () => new Error("Invalid JSON body"),
        }),
      );

      const body = BodySchema.parse(unvalidatedBody);
      const { provider, apiKey, model } = body;

      yield* _(
        Effect.tryPromise({
          try: () =>
            generateText({
              model: getModel(provider, apiKey, model),
              prompt: "This is just a test, answer with 1 token.",
              maxTokens: 1,
            }),
          catch: () => new Error("Invalid API key"),
        }),
      );

      return Response.json({ success: true }, { status: 200 });
    }).pipe(
      Effect.catchAll((err) =>
        Effect.succeed(
          Response.json(
            { error: err && err.message ? err.message : "Internal error" },
            { status: 401 },
          ),
        ),
      ),
    ),
  );
}

import { SETTINGS } from "@/data/settings";
import { getAISettings } from "@/zap/actions/ai.action";
import { getModel } from "@/zap/lib/ai/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamText } from "ai";
import { z } from "zod/v4";
import { Effect } from "effect";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export async function POST(req: Request) {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const session = yield* _(
        Effect.tryPromise({
          try: () => auth.api.getSession({ headers: req.headers }),
          catch: () => new Error("Unauthorized"),
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
      const { provider } = body;

      const { apiKey, model } = yield* _(
        Effect.tryPromise({
          try: () => getAISettings(session.user.id, body.provider),
          catch: () => new Error("Failed to get AI settings"),
        }),
      );

      const result = streamText({
        model: getModel(provider, apiKey, model),
        prompt: body.prompt,
        system: SETTINGS.AI.SYSTEM_PROMPT,
        maxTokens: SETTINGS.AI.COMPLETION?.MAX_TOKENS,
        temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
        presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
        frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
        stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
        maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
      });

      return result.toDataStreamResponse();
    }).pipe(
      Effect.catchAll((err) =>
        Effect.succeed(
          Response.json(
            { error: err.message || "Internal error" },
            { status: 500 },
          ),
        ),
      ),
    ),
  );
}

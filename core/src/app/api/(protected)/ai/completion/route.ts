import "server-only";

import { streamText } from "ai";
import { z } from "zod";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { auth } from "@/zap/lib/auth/server";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { orpcServer } from "@/zap/lib/orpc/server";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);
  const { provider } = body;

  const aiSettings = await orpcServer.ai.getAISettings({
    provider,
  });

  const { apiKey, model } = aiSettings;

  if (!apiKey) {
    return Response.json(
      { error: "API key is required for the selected provider" },
      { status: 400 },
    );
  }

  const result = streamText({
    model: getModel(provider, apiKey, model),
    prompt: body.prompt,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.COMPLETION?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
  });

  return result.toUIMessageStreamResponse();
});

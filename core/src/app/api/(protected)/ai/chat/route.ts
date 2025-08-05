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
  messages: z.any(),
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
    messages: body.messages,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.CHAT?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.CHAT?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.CHAT?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.CHAT?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.CHAT?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.CHAT?.MAX_RETRIES,
  });

  return result.toUIMessageStreamResponse();
});

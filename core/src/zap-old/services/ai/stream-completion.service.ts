import "server-only";

import { streamToEventIterator } from "@orpc/server";
import { streamText } from "ai";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { BadRequestError } from "@/zap/lib/api/errors";
import { getAISettingsService } from "@/zap/services/ai/get-ai-settings.service";
import type { AIProviderId } from "@/zap/types/ai.types";

export interface StreamCompletionService {
  userId: string;
  provider: AIProviderId;
  prompt: string;
}

export async function streamCompletionService({
  userId,
  provider,
  prompt,
}: StreamCompletionService) {
  const aiSettings = await getAISettingsService({
    userId,
    provider,
  });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel(provider, apiKey, model),
    prompt,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.COMPLETION?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

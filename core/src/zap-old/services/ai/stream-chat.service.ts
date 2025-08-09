import "server-only";

import { streamToEventIterator } from "@orpc/server";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { BadRequestError } from "@/zap/lib/api/errors";
import { getAISettingsService } from "@/zap/services/ai/get-ai-settings.service";
import type { AIProviderId } from "@/zap/types/ai.types";

export interface StreamChatService {
  userId: string;
  provider: AIProviderId;
  messages: UIMessage[];
}

export async function streamChatService({
  userId,
  provider,
  messages,
}: StreamChatService) {
  const aiSettings = await getAISettingsService({ userId, provider });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel(provider, apiKey, model),
    messages: convertToModelMessages(messages),
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.CHAT?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.CHAT?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.CHAT?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.CHAT?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.CHAT?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.CHAT?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

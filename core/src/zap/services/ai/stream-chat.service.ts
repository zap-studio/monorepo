import "server-only";

import type { CoreMessage } from "ai";
import { streamText } from "ai";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { BadRequestError } from "@/zap/lib/api/errors";
import { orpcServer } from "@/zap/lib/orpc/server";
import type { AIProviderId } from "@/zap/types/ai.types";

interface StreamChatInput {
  provider: AIProviderId;
  messages: CoreMessage[];
}

export interface StreamChatProps {
  input: StreamChatInput;
}

export async function streamChatService({ input }: StreamChatProps) {
  const { provider, messages } = input;

  const aiSettings = await orpcServer.ai.getAISettings({ provider });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  return streamText({
    model: getModel(provider, apiKey, model),
    messages,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.CHAT?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.CHAT?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.CHAT?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.CHAT?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.CHAT?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.CHAT?.MAX_RETRIES,
  });
}

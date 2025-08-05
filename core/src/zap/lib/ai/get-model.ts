import "server-only";

import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

export function getModel(
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) {
  try {
    const openAI = createOpenAI({ apiKey });
    const mistral = createMistral({ apiKey });

    switch (provider) {
      case "openai":
        return openAI(modelName);
      case "mistral":
        return mistral(modelName);
      default:
        throw new Error(`Invalid provider: ${provider}`);
    }
  } catch (error) {
    throw new Error(
      `Failed to create model ${modelName} for provider ${provider}: ${error}`,
    );
  }
}

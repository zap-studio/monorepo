import "server-only";

import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

import { BadRequestError } from "../api/errors";

export function getModel(
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) {
  const openAI = createOpenAI({ apiKey });
  const mistral = createMistral({ apiKey });

  switch (provider) {
    case "openai":
      return openAI(modelName);
    case "mistral":
      return mistral(modelName);
    default:
      throw new BadRequestError(`The provider "${provider}" is not supported.`);
  }
}

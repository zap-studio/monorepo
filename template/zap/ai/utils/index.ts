import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";

import { BadRequestError } from "@/zap/errors";

import { AI_PROVIDERS_OBJECT } from "../data";
import type { AIProviderId, ModelName } from "../types";

export function getModel(params: {
  provider: AIProviderId;
  apiKey: string;
  modelName: ModelName;
}) {
  const openAI = createOpenAI({ apiKey: params.apiKey });
  const mistral = createMistral({ apiKey: params.apiKey });

  switch (params.provider) {
    case "openai":
      return openAI(params.modelName);
    case "mistral":
      return mistral(params.modelName);
    default:
      throw new BadRequestError(
        `The provider "${params.provider}" is not supported.`
      );
  }
}

export function getProviderName(provider: AIProviderId) {
  return (
    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
    "Select AI Provider"
  );
}

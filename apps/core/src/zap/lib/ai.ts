import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";
import { AI_PROVIDERS_OBJECT } from "../data/ai";
import { AIProviderId, ModelName } from "../types/ai.types";

export const getModel = (
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) => {
  const openAI = createOpenAI({ apiKey });
  const mistral = createMistral({ apiKey });

  let model = null;
  switch (provider) {
    case "openai":
      model = openAI(modelName);
      break;
    case "mistral":
      model = mistral(modelName);
      break;
    default:
      throw new Error("Invalid provider");
  }

  return model;
};

export const getProviderName = (provider: AIProviderId) => {
  return (
    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
    "Select AI Provider"
  );
};

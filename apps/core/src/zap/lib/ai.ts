import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";
import { AIProvider, ModelName } from "@/zap/schemas/ai.schema";

export const getModel = (
  provider: AIProvider,
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

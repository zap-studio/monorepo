import { AIProvider } from "@/store/ai.store";
import { createOpenAI } from "@ai-sdk/openai";
import { createMistral } from "@ai-sdk/mistral";

export const getModel = (provider: AIProvider, apiKey: string) => {
  const openAI = createOpenAI({ apiKey });
  const mistralAI = createMistral({ apiKey });

  let model = null;
  switch (provider) {
    case "openai":
      model = openAI("gpt-4o-mini");
      break;
    case "mistral":
      model = mistralAI("gpt-4o-mini");
      break;
    default:
      throw new Error("Invalid provider");
  }

  return model;
};

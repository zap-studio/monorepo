import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { Effect } from "effect";

import { AI_PROVIDERS_OBJECT } from "@/zap/data/ai";
import { AIProviderId, ModelName } from "@/zap/types/ai.types";

export const getModel = (
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) => {
  return Effect.runSync(
    Effect.gen(function* () {
      const openAI = createOpenAI({ apiKey });
      const mistral = createMistral({ apiKey });

      const model = yield* Effect.try({
        try: () => {
          switch (provider) {
            case "openai":
              return openAI(modelName);
            case "mistral":
              return mistral(modelName);
            default:
              throw new Error(`Invalid provider: ${provider}`);
          }
        },
        catch: (error) =>
          new Error(
            `Failed to create model ${modelName} for provider ${provider}: ${error}`,
          ),
      });

      return model;
    }),
  );
};

export const getProviderName = (provider: AIProviderId) => {
  return (
    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
    "Select AI Provider"
  );
};

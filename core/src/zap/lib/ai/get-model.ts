import "server-only";

import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { Effect } from "effect";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

export function getModel(
  provider: AIProviderId,
  apiKey: string,
  modelName: ModelName,
) {
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
}

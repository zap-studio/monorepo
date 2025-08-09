import "server-only";

import { generateText } from "ai";

import { getModel } from "@/zap/lib/ai/get-model";
import { BadRequestError } from "@/zap/lib/api/errors";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface TestAPIKeyService {
  provider: AIProviderId;
  apiKey: string;
  model: ModelName;
}

export async function testAPIKeyService({
  provider,
  apiKey,
  model,
}: TestAPIKeyService) {
  await generateText({
    model: getModel(provider, apiKey, model),
    prompt: 'Just answer "hello world"',
    maxOutputTokens: 16, // Minimum tokens to minimize cost and time
  }).catch((error) => {
    throw new BadRequestError(
      "Invalid API key or provider configuration",
      error,
    );
  });

  return { message: "API key is valid" };
}

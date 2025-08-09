import "server-only";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

import { saveOrUpdateAISettingsService } from "./save-or-update-ai-settings.service";

interface SaveAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveAISettingsService({
  userId,
  provider,
  model,
  apiKey,
}: SaveAISettingsService) {
  return await saveOrUpdateAISettingsService({
    userId,
    provider,
    model,
    apiKey,
    mode: "create-only",
  });
}

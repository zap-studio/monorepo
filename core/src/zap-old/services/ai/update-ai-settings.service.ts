import "server-only";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

import { saveOrUpdateAISettingsService } from "./save-or-update-ai-settings.service";

interface UpdateAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function updateAISettingsService({
  userId,
  provider,
  apiKey,
  model,
}: UpdateAISettingsService) {
  return await saveOrUpdateAISettingsService({
    userId,
    provider,
    apiKey,
    model,
    mode: "update-only",
  });
}

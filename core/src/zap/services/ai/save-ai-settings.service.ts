import "server-only";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

import { saveOrUpdateAISettingsService } from "./save-or-update-ai-settings.service";

interface SaveAISettingsContext {
  session: { user: { id: string } };
}
interface SaveAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveAISettingsService({
  context,
  input,
}: {
  context: SaveAISettingsContext;
  input: SaveAISettingsInput;
}) {
  return await saveOrUpdateAISettingsService({
    context,
    input,
    mode: "create-only",
  });
}

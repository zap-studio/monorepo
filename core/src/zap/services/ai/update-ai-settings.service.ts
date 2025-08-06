import "server-only";

import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

import { saveOrUpdateAISettingsService } from "./save-or-update-ai-settings.service";

interface UpdateAISettingsContext {
  session: { user: { id: string } };
}
interface UpdateAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function updateAISettingsService({
  context,
  input,
}: {
  context: UpdateAISettingsContext;
  input: UpdateAISettingsInput;
}) {
  return await saveOrUpdateAISettingsService({
    context,
    input,
    mode: "update-only",
  });
}

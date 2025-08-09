import { AI_PROVIDERS_OBJECT } from "@/zap/data/ai";
import type { AIProviderId } from "@/zap/types/ai.types";

export function getProviderName(provider: AIProviderId) {
  return (
    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
    "Select AI Provider"
  );
}

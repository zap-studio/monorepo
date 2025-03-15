import { AIProviders } from "@/schemas/ai.schema";

export const SYSTEM_PROMPT = "";

export const AI_PROVIDERS_OBJECT: AIProviders = [
  {
    provider: "openai",
    name: "OpenAI",
    needsApiKey: true,
  },
  {
    provider: "mistral",
    name: "Mistral AI",
    needsApiKey: true,
  },
];

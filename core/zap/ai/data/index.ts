import type { AIProvider, AIProviderId, ModelName } from "../types";

export const DEFAULT_MODEL: Record<AIProviderId, ModelName> = {
  openai: "gpt-4o-mini",
  mistral: "mistral-small-latest",
};

export const AI_PROVIDERS_OBJECT: AIProvider[] = [
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

export const ModelsByProvider = {
  openai: [
    "o1",
    "o1-mini",
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
  ],
  mistral: [
    "ministral-3b-latest",
    "ministral-8b-latest",
    "mistral-large-latest",
    "mistral-small-latest",
    "pixtral-large-latest",
    "open-mistral-7b",
    "open-mixtral-8x7b",
    "open-mixtral-8x22b",
  ],
} as const;

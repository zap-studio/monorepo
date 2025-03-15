"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AI_PROVIDERS_OBJECT = [
  {
    provider: "openai" as AIProvider,
    name: "OpenAI",
    needsApiKey: true,
  },

  {
    provider: "mistral" as AIProvider,
    name: "Mistral AI",
    needsApiKey: true,
  },
];

export const AI_PROVIDERS = AI_PROVIDERS_OBJECT?.map(
  (provider) => provider.provider,
);

export type AIProvider = "openai" | "mistral";

interface AIProviderStore {
  aiProvider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  setAIProvider: (provider: AIProvider) => void;
  setApiKey: (provider: AIProvider, apiKey: string) => void;
  getProviderName: (provider: AIProvider) => string;
}

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set) => ({
      aiProvider: "openai",
      apiKeys: {
        openai: "",
        mistral: "",
      },

      setAIProvider: (provider) => set({ aiProvider: provider }),
      setApiKey: (provider, apiKey) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: apiKey,
          },
        }));
      },
      getProviderName: (provider) =>
        AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
        "Select AI Provider",
    }),
    {
      name: "ai-provider-store",
    },
  ),
);

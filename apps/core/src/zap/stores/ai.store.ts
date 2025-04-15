"use client";

import { AI_PROVIDERS_OBJECT } from "@/zap/data/ai";
import { AIProvider, ModelName } from "@/zap/schemas/ai.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AIProviderStore {
  provider: AIProvider;
  models: Record<AIProvider, ModelName>;

  setProvider: (provider: AIProvider) => void;
  setModel: (provider: AIProvider, model: ModelName) => void;
  getProviderName: (provider: AIProvider) => string;
}

export const DEFAULT_MODEL: Record<AIProvider, ModelName> = {
  openai: "gpt-4o-mini",
  mistral: "mistral-small-latest",
};

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set) => ({
      provider: "openai",
      models: DEFAULT_MODEL,

      setProvider: (provider) => set({ provider: provider }),
      setModel: (provider, model) =>
        set((state) => ({
          models: {
            ...state.models,
            [provider]: model,
          },
        })),
      getProviderName: (provider) =>
        AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)?.name ??
        "Select AI Provider",
    }),
    {
      name: "ai-provider-store",
    },
  ),
);

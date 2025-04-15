"use client";

import { AI_PROVIDERS_OBJECT } from "@/zap/data/ai";
import { AIModels, AIProviderEnum } from "@/zap/schemas/ai.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AIProviderStore {
  aiProvider: AIProviderEnum;
  models: Record<AIProviderEnum, AIModels>;
  setAIProvider: (provider: AIProviderEnum) => void;
  setApiKey: (provider: AIProviderEnum, apiKey: string) => void;
  getProviderName: (provider: AIProviderEnum) => string;
}

export const useAIProviderStore = create<AIProviderStore>()(
  persist(
    (set) => ({
      aiProvider: "openai",
      models: {
        openai: "gpt-4o-mini",
        mistral: "mistral-small-latest",
      },

      setAIProvider: (provider) => set({ aiProvider: provider }),
      setApiKey: (provider, model) => {
        set((state) => ({
          models: {
            ...state.models,
            [provider]: model,
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

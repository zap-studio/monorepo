"use client";

import { AI_PROVIDERS_OBJECT } from "@/zap/data/ai";
import { AIProviderEnum } from "@/zap/schemas/ai.schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AIProviderStore {
  aiProvider: AIProviderEnum;
  apiKeys: Record<AIProviderEnum, string>;
  setAIProvider: (provider: AIProviderEnum) => void;
  setApiKey: (provider: AIProviderEnum, apiKey: string) => void;
  getProviderName: (provider: AIProviderEnum) => string;
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

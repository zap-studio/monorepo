"use client";
import "client-only";

import { useCompletion } from "@ai-sdk/react";

import { handleClientError } from "@/zap/lib/api/client";
import type { AIProviderId } from "@/zap/types/ai.types";

export function useAICompletion(provider: AIProviderId) {
  return useCompletion({
    api: "/api/ai/completion",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      provider,
    },
    onError: (error: unknown) => {
      handleClientError(error);
    },
  });
}

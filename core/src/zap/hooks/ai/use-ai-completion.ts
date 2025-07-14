"use client";
import "client-only";

import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";

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
    onError: (error) => {
      toast.error(`Completion error: ${error.message}`);
    },
  });
}

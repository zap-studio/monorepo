"use client";

import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { AIProviderId } from "@/zap/types/ai.types";

export function useAIChat(provider: AIProviderId) {
  return useChat({
    api: "/api/ai/chat",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      provider,
    },
    onError: (error) => {
      toast.error(`Chat error: ${error.message}`);
    },
  });
}

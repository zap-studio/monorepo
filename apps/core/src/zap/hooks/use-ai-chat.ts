"use client";

import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { AIProvider } from "../schemas/ai.schema";

export function useAIChat(provider: AIProvider) {
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

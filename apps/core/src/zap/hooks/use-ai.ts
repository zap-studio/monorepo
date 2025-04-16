"use client";

import { useChat, useCompletion } from "@ai-sdk/react";
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

export function useAICompletion(provider: AIProvider) {
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

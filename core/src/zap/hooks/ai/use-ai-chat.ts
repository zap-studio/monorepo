"use client";
import "client-only";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";

import type { AIProviderId } from "@/zap/types/ai.types";

export function useAIChat(provider: AIProviderId) {
  return useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        provider,
      },
    }),
    onError: (error: unknown) => {
      toast.error(
        `Chat error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

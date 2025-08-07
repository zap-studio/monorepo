"use client";
import "client-only";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { handleClientError } from "@/zap/lib/api/client";
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
      handleClientError(error);
    },
  });
}

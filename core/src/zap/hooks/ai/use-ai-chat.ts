"use client";
import "client-only";

import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";

import { handleClientError } from "@/zap/lib/api/client";
import { ApplicationError } from "@/zap/lib/api/errors";
import { orpcClient } from "@/zap/lib/orpc/client";
import type { AIProviderId } from "@/zap/types/ai.types";

export function useAIChat(provider: AIProviderId) {
  return useChat({
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await orpcClient.ai.streamChat(
            {
              messages: options.messages,
              provider,
            },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new ApplicationError("Unsupported");
      },
    },
    onError: (error: unknown) => {
      handleClientError(error);
    },
  });
}

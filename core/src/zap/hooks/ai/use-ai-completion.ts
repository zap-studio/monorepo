"use client";
import "client-only";

import { useCompletion } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import type { CompletionRequestOptions } from "ai";

import { handleClientError } from "@/zap/lib/api/client";
import { orpcClient } from "@/zap/lib/orpc/client";
import type { AIProviderId } from "@/zap/types/ai.types";

export function useAICompletion(provider: AIProviderId, prompt: string) {
  const result = useCompletion({
    fetch: async (_url, options) => {
      const stream = eventIteratorToStream(
        await orpcClient.ai.streamCompletion(
          {
            prompt,
            provider,
          },
          { signal: options?.signal || undefined },
        ),
      );

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },
    onError: (error: unknown) => {
      handleClientError(error);
    },
  });

  const complete = async (options?: CompletionRequestOptions) => {
    await result.complete(prompt, options);
  };

  return { ...result, complete };
}

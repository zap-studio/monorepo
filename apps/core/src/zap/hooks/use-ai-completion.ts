import { toast } from "sonner";
import { AIProvider } from "../schemas/ai.schema";
import { useCompletion } from "@ai-sdk/react";

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

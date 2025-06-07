"use client";

import { useState } from "react";
import { toast } from "sonner";
import { orpc } from "@/zap/lib/orpc/client";
import { AIFormValues } from "@/zap/types/ai.types";
import { Effect } from "effect";

export const useAISettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const saveApiKey = async (values: AIFormValues) => {
    setIsSaving(true);

    if (!values.model) {
      toast.error("Please select a model");
      return;
    }

    await Effect.runPromise(
      Effect.gen(function* (_) {
        if (!values.apiKey) {
          yield* _(
            Effect.tryPromise({
              try: () =>
                orpc.ai.deleteAPIKey.call({ provider: values.provider }),
              catch: () => {
                throw new Error("Failed to delete API key");
              },
            }),
          );

          toast.success("API key deleted successfully");
          setIsValidated(false);
          setInitialKey(null);
        } else {
          yield* _(
            Effect.tryPromise({
              try: () => orpc.ai.saveOrUpdateAISettings.call(values),
              catch: () => {
                throw new Error("Failed to save API key");
              },
            }),
          );

          toast.success("API key saved successfully");
          setInitialKey(values.apiKey);
        }
      }).pipe(
        Effect.catchAll(() =>
          Effect.sync(() => {
            toast.error(
              values.apiKey
                ? "Failed to save API key"
                : "Failed to delete API key",
            );
          }),
        ),
      ),
    );

    setIsSaving(false);
  };

  return {
    isSaving,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    saveApiKey,
  };
};

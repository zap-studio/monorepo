"use client";
import "client-only";

import { Effect } from "effect";
import { useState } from "react";
import type { useForm } from "react-hook-form";
import { toast } from "sonner";

import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues } from "@/zap/types/ai.types";

export function useAISettings(form: ReturnType<typeof useForm<AIFormValues>>) {
  const [isSaving, setIsSaving] = useState(false);
  const [testing, setTesting] = useState(false);
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

  async function handleTestApiKey() {
    setTesting(true);
    await Effect.tryPromise({
      try: () =>
        orpc.ai.testAPIKey.call({
          provider: form.getValues("provider"),
          apiKey: form.getValues("apiKey"),
          model: form.getValues("model"),
        }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: () => {
            toast.success("API key is valid!");
            setIsValidated(true);
          },
          onFailure: () => {
            toast.error("Invalid API key");
            setIsValidated(false);
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("An error occurred while testing the API key");
      });
    setTesting(false);
  }

  return {
    isSaving,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    saveApiKey,
    testing,
    setTesting,
    handleTestApiKey,
  };
}

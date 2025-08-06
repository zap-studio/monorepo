"use client";
import "client-only";

import { useState } from "react";
import type { useForm } from "react-hook-form";

import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues } from "@/zap/types/ai.types";

export function useAISettings(form: ReturnType<typeof useForm<AIFormValues>>) {
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const saveSettingsMutation = useZapMutation(
    "ai-save-settings",
    async (_, { arg }: { arg: AIFormValues }) => {
      if (arg.apiKey) {
        return await orpc.ai.saveOrUpdateAISettings.call(arg);
      }
      return await orpc.ai.deleteAPIKey.call({ provider: arg.provider });
    },
    {
      successMessage: "Settings updated successfully",
    },
  );

  const testApiKeyMutation = useZapMutation(
    "ai-test-api-key",
    async () => {
      return await orpc.ai.testAPIKey.call({
        provider: form.getValues("provider"),
        apiKey: form.getValues("apiKey"),
        model: form.getValues("model"),
      });
    },
    {
      onSuccess: () => {
        setIsValidated(true);
      },
      onError: () => {
        setIsValidated(false);
      },
      successMessage: "API key is valid!",
    },
  );

  const saveApiKey = (values: AIFormValues) => {
    saveSettingsMutation.trigger(values).then(() => {
      if (values.apiKey) {
        setInitialKey(values.apiKey);
      } else {
        setIsValidated(false);
        setInitialKey(null);
      }
    });
  };

  return {
    isSaving: saveSettingsMutation.isMutating,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    saveApiKey,
    testing: testApiKeyMutation.isMutating,
    handleTestApiKey: testApiKeyMutation.trigger,
  };
}

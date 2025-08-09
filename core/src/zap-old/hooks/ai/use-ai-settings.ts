"use client";
import "client-only";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { useForm } from "react-hook-form";

import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues } from "@/zap/types/ai.types";

export function useAISettings(form: ReturnType<typeof useForm<AIFormValues>>) {
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const getAISettingsKey = orpc.ai.getAISettings.key();

  const testApiKeyMutation = useZapMutation({
    ...orpc.ai.testAPIKey.mutationOptions(),
    onSuccess: () => {
      setIsValidated(true);
    },
    onError: () => {
      setIsValidated(false);
    },
    successMessage: "API key is valid!",
  });

  const saveSettingsMutation = useZapMutation({
    ...orpc.ai.saveOrUpdateAISettings.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: getAISettingsKey,
        }),
    }),
    successMessage: "Settings updated successfully",
  });

  const deleteSettingsMutation = useZapMutation({
    ...orpc.ai.deleteAPIKey.mutationOptions(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getAISettingsKey,
      }),
    successMessage: "Settings updated successfully",
  });

  const handleSaveApiKey = async (values: AIFormValues) => {
    if (values.apiKey) {
      await saveSettingsMutation.mutateAsync({ ...values, mode: "upsert" });
    } else {
      await deleteSettingsMutation.mutateAsync(values);
    }
  };

  const handleTestApiKey = async () => {
    return await testApiKeyMutation.mutateAsync({
      provider: form.getValues("provider"),
      apiKey: form.getValues("apiKey"),
      model: form.getValues("model"),
    });
  };

  return {
    saving: saveSettingsMutation.isPending,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    handleSaveApiKey,
    testing: testApiKeyMutation.isPending,
    handleTestApiKey,
  };
}

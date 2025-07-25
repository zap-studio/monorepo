"use client";
import "client-only";

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

    try {
      if (values.apiKey) {
        await orpc.ai.saveOrUpdateAISettings.call(values);

        toast.success("API key saved successfully");
        setInitialKey(values.apiKey);
      } else {
        await orpc.ai.deleteAPIKey.call({ provider: values.provider });

        toast.success("API key deleted successfully");
        setIsValidated(false);
        setInitialKey(null);
      }
    } catch {
      toast.error(
        values.apiKey ? "Failed to save API key" : "Failed to delete API key",
      );
    } finally {
      setIsSaving(false);
    }
  };

  async function handleTestApiKey() {
    setTesting(true);

    try {
      const { success } = await orpc.ai.testAPIKey.call({
        provider: form.getValues("provider"),
        apiKey: form.getValues("apiKey"),
        model: form.getValues("model"),
      });

      if (success) {
        toast.success("API key is valid!");
        setIsValidated(true);
      } else {
        toast.error("Invalid API key");
        setIsValidated(false);
      }
    } catch {
      toast.error("An error occurred while testing the API key");
    } finally {
      setTesting(false);
    }
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

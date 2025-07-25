"use client";
import "client-only";

import { useCallback, useEffect, useState } from "react";
import type { useForm } from "react-hook-form";

import { DEFAULT_MODEL } from "@/zap/data/ai";
import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues, ModelName } from "@/zap/types/ai.types";

export function useInitAISettings(
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<ModelName | null>(null);

  const provider = form.watch("provider");

  const fetchApiKey = useCallback(async () => {
    setLoading(true);

    try {
      const _provider = form.getValues("provider");

      const result = await orpc.ai.getAISettings.call({
        provider: _provider,
      });

      if (result) {
        setApiKey(result.apiKey);
        setModel(result.model);
      } else {
        setApiKey(null);
        setModel(DEFAULT_MODEL[_provider]);
      }
    } catch {
      setApiKey(null);
      setModel(DEFAULT_MODEL[form.getValues("provider")]);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (!(open && provider)) {
      return;
    }

    fetchApiKey();
  }, [open, provider, fetchApiKey]);

  return {
    apiKey,
    setApiKey,
    loading,
    setLoading,
    model,
    setModel,
  };
}

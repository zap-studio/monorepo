"use client";
import "client-only";

import { skipToken } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";

import { DEFAULT_MODEL } from "@/zap/data/ai";
import { useZapQuery } from "@/zap/lib/api/hooks/use-zap-query";
import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues, ModelName } from "@/zap/types/ai.types";

export function useInitAISettings(
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<ModelName | null>(null);

  const provider = form.watch("provider");

  const { data, isLoading } = useZapQuery(
    orpc.ai.getAISettings.queryOptions({
      input: open ? { provider } : skipToken,
    }),
  );

  useEffect(() => {
    if (data) {
      setApiKey(data.apiKey);
      setModel(data.model);
    } else if (provider) {
      setApiKey(null);
      setModel(DEFAULT_MODEL[provider]);
    }
  }, [data, provider]);

  return {
    apiKey,
    setApiKey,
    loading: isLoading,
    model,
    setModel,
  };
}

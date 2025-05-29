import { useEffect, useState } from "react";
import { orpc } from "@/zap/lib/orpc/client";
import { useForm } from "react-hook-form";
import { AIFormValues, ModelName } from "@/zap/types/ai.types";
import { DEFAULT_MODEL } from "@/zap/data/ai";

export const useInitAISettings = (
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) => {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<ModelName | null>(null);

  const provider = form.watch("provider");

  useEffect(() => {
    if (!open || !provider) return;

    const fetchApiKey = async () => {
      setLoading(true);

      try {
        const provider = form.getValues("provider");
        const result = await orpc.ai.getAISettings.call({ provider });

        setApiKey(result.apiKey);
        setModel(result.model);
      } catch {
        // If not found, set model to default according to provider
        setApiKey(null);
        setModel(DEFAULT_MODEL[provider]);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [form, open, provider]);

  return {
    apiKey,
    setApiKey,
    loading,
    setLoading,
    model,
    setModel,
  };
};

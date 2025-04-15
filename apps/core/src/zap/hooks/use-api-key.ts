import { useEffect, useState } from "react";
import { orpc } from "../lib/orpc/client";
import { useForm } from "react-hook-form";
import { AIFormValues } from "../schemas/ai.schema";

export const useAPIKey = (
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) => {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const provider = form.watch("provider");

  useEffect(() => {
    if (!open || !provider) return;

    const fetchApiKey = async () => {
      setLoading(true);

      try {
        const provider = form.getValues("provider");
        const apiKey = await orpc.ai.getAPIKey.call({ provider });

        setApiKey(apiKey);
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
  };
};

import { useEffect, useState } from "react";
import { orpc } from "../lib/orpc/client";
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";

type Form = UseFormReturn<
  {
    provider: "openai" | "mistral";
    apiKey: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    provider: "openai" | "mistral";
    apiKey: string;
  }
>;

export const useAPIKey = (form: Form) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchApiKey = async () => {
      setLoading(true);

      try {
        const provider = form.getValues("provider");
        const apiKey = await orpc.ai.getAPIKey.call({ provider });

        if (apiKey) {
          form.setValue("apiKey", apiKey, { shouldValidate: true });
        } else {
          form.setValue("apiKey", "", { shouldValidate: true });
        }
      } catch {
        toast.error("Failed to fetch API key");
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [form]);

  return {
    loading,
    setLoading,
  };
};

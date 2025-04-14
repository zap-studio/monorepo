import { useEffect, useState } from "react";
import { orpc } from "../lib/orpc/client";
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

export const useAPIKey = (form: Form, open: boolean) => {
  const [loading, setLoading] = useState(false);

  const provider = form.watch("provider");

  useEffect(() => {
    if (!open || !provider) return;

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
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [form, open, provider]);

  return {
    loading,
    setLoading,
  };
};

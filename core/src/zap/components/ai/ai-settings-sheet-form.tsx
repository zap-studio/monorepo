"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { ApiKeyInput } from "@/zap/components/ai/api-key-input";
import { ModelSelect } from "@/zap/components/ai/model-select";
import { ProviderSelect } from "@/zap/components/ai/provider-select";
import { SaveSettings } from "@/zap/components/ai/save-settings";
import { DEFAULT_MODEL, ModelsByProvider } from "@/zap/data/ai";
import { useAISettings } from "@/zap/hooks/ai/use-ai-settings";
import { useInitAISettings } from "@/zap/hooks/ai/use-init-ai-settings";
import { handleClientError } from "@/zap/lib/api/client";
import { AIFormSchema, AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import type { AIFormValues } from "@/zap/types/ai.types";

interface AISettingsSheetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheetForm({
  open,
  onOpenChange,
}: AISettingsSheetFormProps) {
  const [initialApiKey, setInitialApiKey] = useState<string | null>(null);

  const form = useForm<AIFormValues>({
    resolver: zodResolver(AIFormSchema),
    defaultValues: {
      provider: AIProviderIdSchema.options[0],
      model: ModelsByProvider[AIProviderIdSchema.options[0]][0],
      apiKey: "",
    },
  });

  const { saving, handleSaveApiKey, testing, handleTestApiKey } =
    useAISettings(form);

  const { loading, apiKey, model: savedModel } = useInitAISettings(form, open);

  const selectedProvider = form.watch("provider");

  useEffect(() => {
    if (apiKey) {
      setInitialApiKey(apiKey);
      form.setValue("apiKey", apiKey, { shouldValidate: true });
    } else {
      form.resetField("apiKey");
    }
  }, [apiKey, form]);

  useEffect(() => {
    if (selectedProvider && savedModel) {
      form.setValue("model", savedModel, {
        shouldValidate: true,
      });
    } else {
      form.setValue("model", DEFAULT_MODEL[selectedProvider], {
        shouldValidate: true,
      });
    }
  }, [form, savedModel, selectedProvider]);

  const handleSubmit = async (values: AIFormValues) => {
    try {
      await handleSaveApiKey(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      handleClientError(error);
    }
  };

  const isSaveDisabled =
    saving || testing || form.getValues("apiKey") === initialApiKey; // Key unchanged

  return (
    <Form {...form}>
      <form
        className="space-y-6 px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <ProviderSelect control={form.control} disabled={saving} />
        <ModelSelect
          control={form.control}
          disabled={saving}
          provider={selectedProvider}
        />
        <ApiKeyInput
          control={form.control}
          disabled={saving || loading}
          handleTestApiKey={handleTestApiKey}
          loading={loading}
          testing={testing}
        />
        <SaveSettings isSaveDisabled={isSaveDisabled} saving={saving} />
      </form>
    </Form>
  );
}

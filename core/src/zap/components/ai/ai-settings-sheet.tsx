"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApiKeyInput } from "@/zap/components/ai/api-key-input";
import { ModelSelect } from "@/zap/components/ai/model-select";
import { ProviderSelect } from "@/zap/components/ai/provider-select";
import { SaveSettings } from "@/zap/components/ai/save-settings";
import { DEFAULT_MODEL, ModelsByProvider } from "@/zap/data/ai";
import { useAISettings } from "@/zap/hooks/ai/use-ai-settings";
import { useInitAISettings } from "@/zap/hooks/ai/use-init-ai-settings";
import { AIFormSchema, AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import type { AIFormValues } from "@/zap/types/ai.types";

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  const [initialApiKey, setInitialApiKey] = useState<string | null>(null);

  const form = useForm<AIFormValues>({
    resolver: zodResolver(AIFormSchema),
    defaultValues: {
      provider: AIProviderIdSchema.options[0],
      model: ModelsByProvider[AIProviderIdSchema.options[0]][0],
      apiKey: "",
    },
  });

  const { isSaving, saveApiKey, testing, handleTestApiKey } =
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
    await saveApiKey(values);
    onOpenChange(false);
  };

  const isSaveDisabled =
    isSaving || testing || form.getValues("apiKey") === initialApiKey; // Key unchanged

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>AI Settings</SheetTitle>
          <SheetDescription>
            Configure your AI provider and API key securely.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 px-4"
          >
            <ProviderSelect control={form.control} disabled={isSaving} />
            <ModelSelect
              control={form.control}
              disabled={isSaving}
              provider={selectedProvider}
            />
            <ApiKeyInput
              control={form.control}
              disabled={isSaving || loading}
              loading={loading}
              testing={testing}
              handleTestApiKey={handleTestApiKey}
            />
            <SaveSettings isSaving={isSaving} isSaveDisabled={isSaveDisabled} />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

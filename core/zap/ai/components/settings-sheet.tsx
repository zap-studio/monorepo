"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { type Control, useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ZapButton } from "@/zap/components/core/button";
import { handleClientError } from "@/zap/errors/client";

import { AI_PROVIDERS_OBJECT, DEFAULT_MODEL, ModelsByProvider } from "../data";
import { useAISettings, useInitAISettings } from "../hooks";
import { AIFormSchema, AIProviderIdSchema } from "../schemas";
import type { AIFormValues, AIProviderId } from "../types";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>AI Providers</SheetTitle>
          <SheetDescription>
            Configure your AI provider and API key securely.
          </SheetDescription>
        </SheetHeader>

        <SettingsSheetForm onOpenChange={onOpenChange} open={open} />
      </SheetContent>
    </Sheet>
  );
}

type SettingsSheetFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function SettingsSheetForm({ open, onOpenChange }: SettingsSheetFormProps) {
  const [initialApiKey, setInitialApiKey] = useState<string | null>(null);

  const form = useForm<AIFormValues>({
    resolver: zodResolver(AIFormSchema),
    defaultValues: {
      provider: AIProviderIdSchema.options[0],
      model: DEFAULT_MODEL[AIProviderIdSchema.options[0] as AIProviderId],
      apiKey: "",
    },
  });

  const { loading, apiKey, model: savedModel } = useInitAISettings(form, open);
  const { saving, handleSaveApiKey, testing, handleTestApiKey } =
    useAISettings(form);

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

type FormFieldProps = {
  control: Control<AIFormValues>;
  disabled: boolean;
};

function ProviderSelect({ control, disabled }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Provider</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {AIProviderIdSchema.options.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {
                    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)
                      ?.name
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type ModelSelectProps = {
  control: Control<AIFormValues>;
  disabled: boolean;
  provider: AIProviderId;
};

function ModelSelect({ control, disabled, provider }: ModelSelectProps) {
  const models = ModelsByProvider[provider as keyof typeof ModelsByProvider];

  return (
    <FormField
      control={control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ApiKeyInput({
  control,
  disabled,
  loading,
  testing,
  handleTestApiKey,
}: FormFieldProps & {
  loading: boolean;
  testing: boolean;
  handleTestApiKey: () => Promise<{
    message: string;
  }>;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <div className="flex items-end space-x-2">
          <FormItem className="flex-1">
            <FormLabel>API Key</FormLabel>
            <FormControl className="relative flex-1">
              <div className="relative">
                <Input
                  placeholder={loading ? "Loading..." : "Enter your API key"}
                  type={showKey ? "text" : "password"}
                  {...field}
                  className="pr-10 font-mono"
                  disabled={disabled}
                />

                <button
                  className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground hover:text-foreground active:text-foreground"
                  onClick={() => setShowKey((prev) => !prev)}
                  tabIndex={-1}
                  type="button"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>

          <ZapButton
            disabled={disabled || !field.value}
            loading={testing}
            loadingText="Testing..."
            onClick={handleTestApiKey}
            type="button"
            variant="outline"
          >
            Test API Key
          </ZapButton>
        </div>
      )}
    />
  );
}

type SaveSettingsProps = {
  saving: boolean;
  isSaveDisabled: boolean;
};

function SaveSettings({ saving, isSaveDisabled }: SaveSettingsProps) {
  return (
    <div className="flex justify-end">
      <ZapButton
        className="w-full sm:w-auto"
        disabled={isSaveDisabled}
        loading={saving}
        loadingText="Saving..."
        type="submit"
      >
        Save Settings
      </ZapButton>
    </div>
  );
}

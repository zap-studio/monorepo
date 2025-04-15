"use client";

import { useState, useEffect } from "react";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  aiFormSchema,
  AIFormValues,
  AIProviderEnumSchema,
} from "@/zap/schemas/ai.schema";
import { orpc } from "@/zap/lib/orpc/client";
import { useAPIKey } from "@/zap/hooks/use-api-key";

const useApiKeyManager = (form: ReturnType<typeof useForm<AIFormValues>>) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const saveApiKey = async (values: AIFormValues) => {
    setIsSaving(true);
    try {
      if (!values.apiKey) {
        // Delete API key when saving empty
        await orpc.ai.deleteAPIKey.call({ provider: values.provider });
        toast.success("API key deleted successfully");
        form.setValue("apiKey", "", { shouldValidate: true });
        setIsValidated(false);
        setInitialKey(null);
      } else {
        await orpc.ai.saveOrUpdateAPIKey.call(values);
        toast.success("API key saved successfully");
        setInitialKey(values.apiKey);
      }
      return true;
    } catch {
      toast.error(
        values.apiKey ? "Failed to save API key" : "Failed to delete API key",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    saveApiKey,
  };
};

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  const [testing, setTesting] = useState(false);
  const [initialApiKey, setInitialApiKey] = useState<string | null>(null);

  const form = useForm<AIFormValues>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      provider: AIProviderEnumSchema.options[0],
      apiKey: "",
    },
  });

  const { loading, apiKey } = useAPIKey(form, open);
  const { isSaving, setIsValidated, saveApiKey } = useApiKeyManager(form);

  useEffect(() => {
    if (apiKey) {
      setInitialApiKey(apiKey);
      form.setValue("apiKey", apiKey, { shouldValidate: true });
    }
  }, [apiKey, form]);

  const handleSubmit = async (values: AIFormValues) => {
    const success = await saveApiKey(values);
    if (success) {
      onOpenChange(false);
    }
  };

  async function handleTestApiKey() {
    setTesting(true);
    try {
      await orpc.ai.testAPIKey.call({
        provider: form.getValues("provider"),
        apiKey: form.getValues("apiKey"),
      });
      toast.success("API key is valid!");
      setIsValidated(true);
    } catch {
      toast.error("Invalid API key");
      setIsValidated(false);
    } finally {
      setTesting(false);
    }
  }

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
            <ApiKeyInput
              control={form.control}
              disabled={isSaving || loading}
              loading={loading}
              testing={testing}
              handleTestApiKey={handleTestApiKey}
            />
            <ActionButtons
              isSaving={isSaving}
              isSaveDisabled={isSaveDisabled}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

interface FormFieldProps {
  control: Control<AIFormValues>;
  disabled: boolean;
}

function ProviderSelect({ control, disabled }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Provider</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {AIProviderEnumSchema.options.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
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
  handleTestApiKey: () => void;
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
                  type={showKey ? "text" : "password"}
                  placeholder={loading ? "Loading..." : "Enter your API key"}
                  {...field}
                  disabled={disabled}
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestApiKey}
            disabled={disabled || !field.value || testing}
          >
            {testing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Testing...
              </>
            ) : (
              "Test API Key"
            )}
          </Button>
        </div>
      )}
    />
  );
}

function ActionButtons({
  isSaving,
  isSaveDisabled,
}: {
  isSaving: boolean;
  isSaveDisabled: boolean;
}) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSaving || isSaveDisabled}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}

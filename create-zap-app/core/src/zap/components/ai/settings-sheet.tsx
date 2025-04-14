"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import {
  aiFormSchema,
  AIFormValues,
  AIProviderEnum,
  AIProviderEnumSchema,
} from "@/zap/schemas/ai.schema";
import { orpc } from "@/zap/lib/orpc/client";
import { useAPIKey } from "@/zap/hooks/use-api-key";

const useApiKeyManager = (form: ReturnType<typeof useForm<AIFormValues>>) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const saveApiKey = async (values: AIFormValues) => {
    setIsSaving(true);
    try {
      await orpc.ai.saveOrUpdateAPIKey.call(values);
      toast.success("API key saved successfully");
      form.setValue("apiKey", "", { shouldValidate: true });
      return true;
    } catch {
      toast.error("Failed to save API key");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApiKey = async (provider: AIProviderEnum) => {
    setIsDeleting(true);
    try {
      await orpc.ai.deleteAPIKey.call({ provider });
      toast.success("API key deleted successfully");
      form.setValue("apiKey", "", { shouldValidate: true });
    } catch {
      toast.error("Failed to delete API key");
    } finally {
      setIsDeleting(false);
    }
  };

  return { isSaving, isDeleting, saveApiKey, deleteApiKey };
};

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  const form = useForm<AIFormValues>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      provider: AIProviderEnumSchema.options[0],
      apiKey: "",
    },
  });

  const { loading } = useAPIKey(form, open);
  const { isSaving, isDeleting, saveApiKey, deleteApiKey } =
    useApiKeyManager(form);

  const handleSubmit = async (values: AIFormValues) => {
    const success = await saveApiKey(values);
    if (success) {
      onOpenChange(false);
    }
  };

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
            <ProviderSelect
              control={form.control}
              disabled={isSaving || isDeleting}
            />
            <ApiKeyInput
              control={form.control}
              disabled={isSaving || isDeleting || loading}
              loading={loading}
            />
            <ActionButtons
              isSaving={isSaving}
              isDeleting={isDeleting}
              hasKey={!!form.watch("apiKey")}
              onDelete={() => deleteApiKey(form.getValues("provider"))}
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
}: FormFieldProps & { loading: boolean }) {
  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>API Key</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={loading ? "Loading..." : "Enter your API key"}
              {...field}
              disabled={disabled}
              className="font-mono"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ActionButtons({
  isSaving,
  isDeleting,
  hasKey,
  onDelete,
}: {
  isSaving: boolean;
  isDeleting: boolean;
  hasKey: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        disabled={isSaving || isDeleting || !hasKey}
        onClick={onDelete}
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete API Key"
        )}
      </Button>
      <Button
        type="submit"
        className="w-full"
        disabled={isSaving || isDeleting || !hasKey}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}

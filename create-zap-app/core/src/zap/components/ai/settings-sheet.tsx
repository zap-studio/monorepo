"use client";

import { useState } from "react";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AIFormValues>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      provider: AIProviderEnumSchema.options[0] as AIProviderEnum,
      apiKey: "",
    },
  });

  const { loading } = useAPIKey(form);

  const isBusy = submitting || loading;

  const handleSave = async (values: AIFormValues) => {
    setSubmitting(true);
    try {
      await orpc.ai.saveOrUpdateAPIKey.call(values);
      toast.success("API key saved successfully!");
      form.setValue("apiKey", "", { shouldValidate: true });
      onOpenChange(false);
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const provider = form.getValues("provider");
      await orpc.ai.deleteAPIKey.call({ provider });
      toast.success("API key deleted successfully!");
      form.setValue("apiKey", "", { shouldValidate: true });
    } catch {
      toast.error("Failed to delete API key");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AI Provider Settings</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="mt-4 space-y-4"
          >
            <ProviderSelect control={form.control} disabled={isBusy} />
            <ApiKeyInput
              control={form.control}
              disabled={isBusy}
              loading={loading}
            />
            <ActionButtons
              isBusy={isBusy}
              hasKey={!!form.getValues("apiKey")}
              onDelete={handleDelete}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

function ProviderSelect({
  control,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  disabled: boolean;
}) {
  return (
    <FormField
      control={control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Provider</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="mistral">Mistral</SelectItem>
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
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  disabled: boolean;
  loading: boolean;
}) {
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
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ActionButtons({
  isBusy,
  hasKey,
  onDelete,
}: {
  isBusy: boolean;
  hasKey: boolean;
  onDelete: () => void;
}) {
  return (
    <>
      <Button type="submit" className="w-full" disabled={isBusy}>
        {isBusy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
      <Button
        type="button"
        variant="destructive"
        className="w-full"
        disabled={isBusy || !hasKey}
        onClick={onDelete}
      >
        {isBusy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete API Key"
        )}
      </Button>
    </>
  );
}

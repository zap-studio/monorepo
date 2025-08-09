"use client";
import "client-only";

import { useChat, useCompletion } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { CompletionRequestOptions } from "ai";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { DEFAULT_MODEL } from "@/zap/ai/data";
import type { AIFormValues, AIProviderId, ModelName } from "@/zap/ai/types";
import { useZapMutation } from "@/zap/api/hooks/use-zap-mutation";
import { useZapQuery } from "@/zap/api/hooks/use-zap-query";
import { orpc, orpcClient } from "@/zap/api/providers/orpc/client";
import { ApplicationError } from "@/zap/errors";
import { handleClientError } from "@/zap/errors/client";

export function useAIChat(provider: AIProviderId) {
  return useChat({
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await orpcClient.ai.streamChat(
            {
              messages: options.messages,
              provider,
            },
            { signal: options.abortSignal },
          ),
        );
      },
      reconnectToStream() {
        throw new ApplicationError("Unsupported");
      },
    },
    onError: (error: unknown) => {
      handleClientError(error);
    },
  });
}

export function useAICompletion(prompt: string, provider: AIProviderId) {
  const result = useCompletion({
    fetch: async (_url, options) => {
      const stream = eventIteratorToStream(
        await orpcClient.ai.streamCompletion(
          {
            prompt,
            provider,
          },
          { signal: options?.signal || undefined },
        ),
      );

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },
    onError: (error: unknown) => {
      handleClientError(error);
    },
  });

  const complete = async (options?: CompletionRequestOptions) => {
    await result.complete(prompt, options);
  };

  return { ...result, complete };
}

export function useAISettings(form: ReturnType<typeof useForm<AIFormValues>>) {
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const getAISettingsKey = orpc.ai.getAISettings.key();

  const testApiKeyMutation = useZapMutation({
    ...orpc.ai.testAPIKey.mutationOptions(),
    onSuccess: () => {
      setIsValidated(true);
    },
    onError: () => {
      setIsValidated(false);
    },
    successMessage: "API key is valid!",
  });

  const saveSettingsMutation = useZapMutation({
    ...orpc.ai.saveOrUpdateAISettings.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({
          queryKey: getAISettingsKey,
        }),
    }),
    successMessage: "Settings updated successfully",
  });

  const deleteSettingsMutation = useZapMutation({
    ...orpc.ai.deleteAPIKey.mutationOptions(),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getAISettingsKey,
      }),
    successMessage: "Settings updated successfully",
  });

  const handleSaveApiKey = async (values: AIFormValues) => {
    if (values.apiKey) {
      await saveSettingsMutation.mutateAsync({ ...values, mode: "upsert" });
    } else {
      await deleteSettingsMutation.mutateAsync(values);
    }
  };

  const handleTestApiKey = async () => {
    return await testApiKeyMutation.mutateAsync({
      provider: form.getValues("provider"),
      apiKey: form.getValues("apiKey"),
      model: form.getValues("model"),
    });
  };

  return {
    saving: saveSettingsMutation.isPending,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    handleSaveApiKey,
    testing: testApiKeyMutation.isPending,
    handleTestApiKey,
  };
}

export function useInitAISettings(
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<ModelName | null>(null);

  const provider = form.watch("provider");

  const { data, isLoading } = useZapQuery(
    orpc.ai.getAISettings.queryOptions({
      input: { provider },
      enabled: open,
    }),
  );

  useEffect(() => {
    if (data) {
      setApiKey(data.apiKey);
      setModel(data.model);
    } else if (provider) {
      setApiKey(null);
      setModel(DEFAULT_MODEL[provider]);
    }
  }, [data, provider]);

  return {
    apiKey,
    setApiKey,
    loading: isLoading,
    model,
    setModel,
  };
}

import { z } from "zod";

import { UpsertModeSchema } from "@/zap/db/types";

import { ModelsByProvider } from "../data";
import { AIProviderIdEnum } from "../zap.plugin.config.types";

export const AIProviderIdSchema = z.enum(
  Object.values(AIProviderIdEnum) as [string, ...string[]]
);

export const AIProviderSchema = z.object({
  provider: AIProviderIdSchema,
  name: z.string(),
  needsApiKey: z.boolean(),
});

export const ModelNameSchema = z.enum(
  Object.values(ModelsByProvider).flat() as [string, ...string[]]
);

export const AIFormSchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string().min(1, "API key is required"),
});

export const InputGetAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
});

export const InputSaveAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
  mode: UpsertModeSchema,
});

export const InputUpdateAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
});

export const InputDeleteAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
});

export const InputTestAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

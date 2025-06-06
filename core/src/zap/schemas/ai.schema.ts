import { z } from "zod/v4";
import { ModelsByProvider } from "@/zap/data/ai";

export const AIProviderIdSchema = z.enum(["openai", "mistral"]);

export const AIProviderSchema = z.object({
  provider: AIProviderIdSchema,
  name: z.string(),
  needsApiKey: z.boolean(),
});

export const ModelNameSchema = z.enum([
  ...ModelsByProvider[AIProviderIdSchema.options[0]],
  ...ModelsByProvider[AIProviderIdSchema.options[1]],
]);

export const AIFormSchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string().min(1, "API key is required"),
});

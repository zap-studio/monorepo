import { z } from "zod";
import { ModelsByProvider } from "../data/ai";

export const AIProviderEnumSchema = z.enum(["openai", "mistral"]);
export type AIProvider = z.infer<typeof AIProviderEnumSchema>;

export const AIProviderItemSchema = z.object({
  provider: AIProviderEnumSchema,
  name: z.string(),
  needsApiKey: z.boolean(),
});
export const AIProvidersSchema = z.array(AIProviderItemSchema);
export type AIProviders = z.infer<typeof AIProvidersSchema>;

export type AIProviderItem = z.infer<typeof AIProviderItemSchema>;

export const modelNameSchema = z.enum([
  ...ModelsByProvider[AIProviderEnumSchema.options[0]],
  ...ModelsByProvider[AIProviderEnumSchema.options[1]],
]);
export type ModelName = z.infer<typeof modelNameSchema>;

export const aiFormSchema = z.object({
  provider: AIProviderEnumSchema,
  model: modelNameSchema,
  apiKey: z.string().min(1, "API key is required"),
});
export type AIFormValues = z.infer<typeof aiFormSchema>;

import { z } from "zod";

export const AIProviderEnumSchema = z.enum(["openai", "mistral"]);

export const AIProviderItemSchema = z.object({
  provider: AIProviderEnumSchema,
  name: z.string(),
  needsApiKey: z.boolean(),
});
export const AIProvidersSchema = z.array(AIProviderItemSchema);

export type AIProviderEnum = z.infer<typeof AIProviderEnumSchema>;
export type AIProviderItem = z.infer<typeof AIProviderItemSchema>;
export type AIProviders = z.infer<typeof AIProvidersSchema>;

export const aiFormSchema = z.object({
  provider: AIProviderEnumSchema,
  apiKey: z.string().min(1, "API key is required"),
});
export type AIFormValues = z.infer<typeof aiFormSchema>;

export const OpenAIModelsSchema = z.enum([
  "o1",
  "o1-mini",
  "o3-mini",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
]);
export const MistralModelsSchema = z.enum([
  "ministral-3b-latest",
  "ministral-8b-latest",
  "mistral-large-latest",
  "mistral-small-latest",
  "pixtral-large-latest",
  "open-mistral-7b",
  "open-mixtral-8x7b",
  "open-mixtral-8x22b",
]);

export type OpenAIModels = z.infer<typeof OpenAIModelsSchema>;
export type MistralModels = z.infer<typeof MistralModelsSchema>;

export const AIModelsSchema = z.union([
  OpenAIModelsSchema,
  MistralModelsSchema,
]);
export type AIModels = z.infer<typeof AIModelsSchema>;

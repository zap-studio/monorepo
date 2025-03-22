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

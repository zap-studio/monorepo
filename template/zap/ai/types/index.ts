import type { z } from "zod";

import type {
  AIFormSchema,
  AIProviderIdSchema,
  AIProviderSchema,
  ModelNameSchema,
} from "../schemas";

export const AIProviderIdEnum = {
  OPENAI: "openai",
  MISTRAL: "mistral",
} as const;

export type AIProviderId = z.infer<typeof AIProviderIdSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ModelName = z.infer<typeof ModelNameSchema>;
export type AIFormValues = z.infer<typeof AIFormSchema>;

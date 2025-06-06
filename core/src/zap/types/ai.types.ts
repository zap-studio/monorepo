import { z } from "zod/v4";
import {
  AIProviderSchema,
  AIProviderIdSchema,
  ModelNameSchema,
  AIFormSchema,
} from "@/zap/schemas/ai.schema";

export type AIProviderId = z.infer<typeof AIProviderIdSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type ModelName = z.infer<typeof ModelNameSchema>;
export type AIFormValues = z.infer<typeof AIFormSchema>;

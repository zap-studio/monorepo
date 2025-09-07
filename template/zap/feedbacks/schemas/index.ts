import { z } from "zod";
import { ZAP_FEEDBACKS_CONFIG } from "../zap.plugin.config";

export const InputFeedbackSchema = z.object({
  rating: z.number().min(0).max(ZAP_FEEDBACKS_CONFIG.MAX_RATING),
  description: z
    .string()
    .max(ZAP_FEEDBACKS_CONFIG.MAX_DESCRIPTION_LENGTH, {
      error: `Description must be ${ZAP_FEEDBACKS_CONFIG.MAX_DESCRIPTION_LENGTH} characters or less`,
    })
    .optional(),
});

import { z } from "zod/v4";

export const FeedbackSchema = z.object({
  rating: z.number().min(0).max(10),
  description: z
    .string()
    .max(500, { error: "Description must be 500 characters or less" })
    .optional(),
});

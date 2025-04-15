import { z } from "zod";

export const FeedbackSchema = z.object({
  rating: z.number().min(0).max(10),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
});

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

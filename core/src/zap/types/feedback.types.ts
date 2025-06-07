import { z } from "zod/v4";
import { FeedbackSchema } from "@/zap/schemas/feedback.schema";

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

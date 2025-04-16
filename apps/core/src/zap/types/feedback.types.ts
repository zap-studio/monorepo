import { z } from "zod";
import { FeedbackSchema } from "../schemas/feedback.schema";

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

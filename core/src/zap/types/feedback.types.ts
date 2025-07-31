import type { z } from "zod";

import type { FeedbackSchema } from "@/zap/schemas/feedback.schema";

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

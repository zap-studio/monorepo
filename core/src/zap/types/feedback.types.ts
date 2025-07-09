import type { z } from "zod/v4";

import type { FeedbackSchema } from "@/zap/schemas/feedback.schema";

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;

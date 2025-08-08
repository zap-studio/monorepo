import type { z } from "zod";

import type { InputFeedbackSchema } from "@/zap/schemas/feedback.schema";

export type FeedbackFormValues = z.infer<typeof InputFeedbackSchema>;

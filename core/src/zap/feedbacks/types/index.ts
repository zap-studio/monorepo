import type { z } from "zod";

import type { InputFeedbackSchema } from "@/zap/feedbacks/schemas";

export type FeedbackFormValues = z.infer<typeof InputFeedbackSchema>;

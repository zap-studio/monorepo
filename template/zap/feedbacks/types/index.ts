import type { z } from "zod";

import type { InputFeedbackSchema } from "../schemas";

export type FeedbackFormValues = z.infer<typeof InputFeedbackSchema>;

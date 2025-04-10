import { authMiddleware, base } from "../middlewares";
import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";
import { feedbackSchema } from "@/schemas/feedback.schema";
import { eq } from "drizzle-orm";

export const feedback = {
  submit: base
    .use(authMiddleware)
    .input(feedbackSchema)
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      await db.insert(feedbackTable).values({
        userId,
        rating: input.rating,
        description: input.description || "",
        submittedAt: new Date(),
      });

      return { success: true };
    }),

  getUserFeedback: base.use(authMiddleware).handler(async ({ context }) => {
    const userId = context.session.user.id;

    const existingFeedback = await db
      .select()
      .from(feedbackTable)
      .where(eq(feedbackTable.userId, userId))
      .limit(1);

    return existingFeedback.length > 0 ? existingFeedback[0] : null;
  }),
};

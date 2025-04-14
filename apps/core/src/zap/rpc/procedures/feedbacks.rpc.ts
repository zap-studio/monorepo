import { authMiddleware, base } from "@/rpc/middlewares";
import { db } from "@/db";
import { feedback as feedbackTable } from "@/db/schema";
import { feedbackSchema } from "@/zap/schemas/feedback.schema";
import { eq } from "drizzle-orm";

const submit = base
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
  });

const getUserFeedback = base
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;

    const existingFeedback = await db
      .select()
      .from(feedbackTable)
      .where(eq(feedbackTable.userId, userId))
      .limit(1);

    return existingFeedback.length > 0 ? existingFeedback[0] : null;
  });

const getAverageRating = base.handler(async () => {
  const feedbacks = await db
    .select({
      rating: feedbackTable.rating,
    })
    .from(feedbackTable);

  if (feedbacks.length === 0) {
    return {
      averageRating: 5,
      totalFeedbacks: 1,
    };
  }

  const totalRating = feedbacks.reduce((acc, feedback) => {
    return acc + feedback.rating;
  }, 0);

  const averageRatingOnTen = totalRating / feedbacks.length;
  const averageRating = (averageRatingOnTen / 10) * 5;

  return { averageRating, totalFeedbacks: feedbacks.length };
});

export const feedbacks = {
  submit,
  getUserFeedback,
  getAverageRating,
};

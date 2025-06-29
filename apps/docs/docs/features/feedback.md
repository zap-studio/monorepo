# Feedback System

Zap.ts includes a comprehensive feedback system that allows users to provide ratings and detailed feedback about your application. This system is designed to be user-friendly, type-safe, and easily extensible.

## Overview

- **User Ratings:** 0-10 rating scale with visual feedback
- **Detailed Feedback:** Optional text descriptions for qualitative insights
- **One-time Submission:** Users can only submit feedback once per account
- **Type-safe:** Full TypeScript and Zod validation
- **Real-time UI:** Optimistic updates with rollback on error
- **Persistent Storage:** Feedback stored securely in PostgreSQL

## How it Works

The feedback system consists of several components working together:

### 1. Database Schema

Feedback is stored in a dedicated table with user associations:

```sql
-- src/zap/db/schema/feedback.sql.ts
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => user.id),
  rating: integer("rating").notNull(),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});
```

### 2. Server Actions

Feedback submission is handled through type-safe server actions:

```ts
// src/zap/actions/feedbacks/submit-feedback.action.ts
export const submitFeedbackAction = async ({
  context,
  input,
}: {
  context: SubmitFeedbackContext;
  input: SubmitFeedbackInput;
}) => {
  return await Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .insert(feedbackTable)
              .values({
                userId,
                rating: input.rating,
                description: input.description || "",
                submittedAt: new Date(),
              })
              .execute(),
          catch: (e) => new Error("Field to insert feedback"),
        })
      );

      return { success: true };
    })
  );
};
```

### 3. React Hooks

Custom hooks provide a clean API for feedback functionality:

```ts
// src/zap/hooks/features/feedbacks/use-feedback.ts
export const useUserFeedback = () => {
  const orpc = useORPC();
  return useSWR(
    orpc.feedbacks.getUserFeedback.key(),
    orpc.feedbacks.getUserFeedback.queryOptions().queryFn
  );
};

export const useSubmitFeedback = (
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const orpc = useORPC();

  return useSWRMutation(orpc.feedbacks.submit.key(), giveFeedback, {
    optimisticData: (current) => ({ ...current, success: true }),
    rollbackOnError: true,
    revalidate: true,
    onSuccess: () => {
      setIsExistingFeedback(true);
      toast.success("Thank you for your feedback!");
    },
    onError: () => {
      setIsExistingFeedback(false);
      toast.error("Failed to submit feedback. Please try again.");
    },
  });
};
```

### 4. UI Components

The feedback dialog provides an intuitive interface:

```tsx
// src/zap/components/sidebar/sidebar-feedback-dialog.tsx
export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { trigger: submitFeedback, isMutating: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  // Rating buttons with visual feedback
  const RatingButtons = () => {
    const rating = form.watch("rating");
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {Array.from({ length: 11 }, (_, i) => (
          <Button
            key={i}
            variant={i <= rating ? "default" : "outline"}
            onClick={() => form.setValue("rating", i)}
            disabled={isSubmitting || !!isExistingFeedback}
          >
            {i}
          </Button>
        ))}
      </div>
    );
  };

  // Form with rating and description fields
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating field */}
            {/* Description field */}
            {/* Submit button */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

## Usage

### 1. Add Feedback Dialog to Your App

Include the feedback dialog in your sidebar or settings:

```tsx
import { FeedbackDialog } from "@/zap/components/sidebar/sidebar-feedback-dialog";

export function Sidebar() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setFeedbackOpen(true)}>Give Feedback</Button>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
}
```

### 2. Check if User Has Submitted Feedback

Use the hook to check feedback status:

```tsx
import { useIsFeedbackSubmitted } from "@/zap/hooks/features/feedbacks/use-feedback";

export function FeedbackButton() {
  const { isExistingFeedback } = useIsFeedbackSubmitted();

  if (isExistingFeedback) {
    return <div>Thank you for your feedback!</div>;
  }

  return <Button>Give Feedback</Button>;
}
```

### 3. Customize the Rating Scale

Modify the rating range by updating the component:

```tsx
// Change from 0-10 to 1-5 stars
{
  Array.from({ length: 5 }, (_, i) => (
    <Button
      key={i + 1}
      variant={i + 1 <= rating ? "default" : "outline"}
      onClick={() => form.setValue("rating", i + 1)}
    >
      ⭐
    </Button>
  ));
}
```

## Data Analysis

### Retrieving Feedback Data

Use the RPC procedures to analyze feedback:

```ts
// Get average rating
const averageRating = await orpc.feedbacks.getAverageRating.call();

// Get user's specific feedback
const userFeedback = await orpc.feedbacks.getUserFeedback.call();
```

### Feedback Schema

```ts
// src/zap/schemas/feedback.schema.ts
export const FeedbackSchema = z.object({
  rating: z.number().min(0).max(10),
  description: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof FeedbackSchema>;
```

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ZapButton } from "@/zap/components/button";
import { RatingButtons } from "@/zap/components/sidebar/rating-buttons";
import { useIsFeedbackSubmitted } from "@/zap/hooks/feedbacks/use-is-feedback-submitted";
import { useSubmitFeedback } from "@/zap/hooks/feedbacks/use-submit-feedback";
import { InputFeedbackSchema } from "@/zap/schemas/feedback.schema";
import type { FeedbackFormValues } from "@/zap/types/feedback.types";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { mutateAsync: submitFeedback, isPending: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(InputFeedbackSchema),
    defaultValues: { rating: 0, description: "" },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    await submitFeedback(data);
    setSubmitted(true);
    form.reset();
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        {submitted || isExistingFeedback ? (
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Thank you!</h2>
            <p className="text-muted-foreground text-sm">
              We appreciate your input and will use it to improve your
              experience.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share Your Feedback</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={() => (
                    <FormItem>
                      <FormLabel>Rate us (0–10)</FormLabel>
                      <FormControl>
                        <RatingButtons
                          form={form}
                          isExistingFeedback={isExistingFeedback}
                          isSubmitting={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tell us more (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts..."
                          {...field}
                          aria-label="Feedback text area"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ZapButton
                  className="w-full"
                  loading={isSubmitting}
                  loadingText="Submitting..."
                  type="submit"
                >
                  Submit Feedback
                </ZapButton>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

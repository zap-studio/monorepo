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
import { ZapButton } from "@/components/zap-ui/button";
import { cn } from "@/lib/utils";
import { useIsFeedbackSubmitted } from "@/zap/hooks/feedbacks/use-is-feedback-submitted";
import { useSubmitFeedback } from "@/zap/hooks/feedbacks/use-submit-feedback";
import { FeedbackSchema } from "@/zap/schemas/feedback.schema";
import { FeedbackFormValues } from "@/zap/types/feedback.types";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { trigger: submitFeedback, isMutating: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: { rating: 0, description: "" },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    await submitFeedback(data);
    setSubmitted(true);
    form.reset();
  };

  const RatingButtons = () => {
    const rating = form.watch("rating");
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {Array.from({ length: 11 }, (_, i) => {
          const isActive = i <= rating;
          return (
            <ZapButton
              key={i}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-10 w-10 rounded-md p-0 text-sm",
                "transform transition-all duration-200 ease-in-out",
                "hover:scale-110",
                isActive && "bg-primary text-white",
              )}
              onClick={() => form.setValue("rating", i)}
              aria-label={`Rate ${i}`}
              disabled={isSubmitting || !!isExistingFeedback}
            >
              {i}
            </ZapButton>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {!submitted && !isExistingFeedback ? (
          <>
            <DialogHeader>
              <DialogTitle>Share Your Feedback</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="rating"
                  render={() => (
                    <FormItem>
                      <FormLabel>Rate us (0–10)</FormLabel>
                      <FormControl>
                        <RatingButtons />
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
                          disabled={isSubmitting}
                          aria-label="Feedback text area"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ZapButton
                  loading={isSubmitting}
                  loadingText="Submitting..."
                  type="submit"
                  className="w-full"
                >
                  Submit Feedback
                </ZapButton>
              </form>
            </Form>
          </>
        ) : (
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold">Thank you!</h2>
            <p className="text-muted-foreground text-sm">
              We appreciate your input and will use it to improve your
              experience.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

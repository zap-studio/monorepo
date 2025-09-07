"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

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
import { cn } from "@/lib/utils";
import { ZapButton } from "@/zap/components/core/button";

import { useIsFeedbackSubmitted, useSubmitFeedback } from "../hooks";
import { InputFeedbackSchema } from "../schemas";
import type { FeedbackFormValues } from "../types";

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MIN_RATING = 0 as const;
const MAX_RATING = 10 as const;
const DEFAULT_RATING = MIN_RATING;

const RATING_VALUES = (() => {
  const values: number[] = [];
  let current = MIN_RATING;
  while (current <= MAX_RATING) {
    values.push(current);
    current += 1;
  }
  return values;
})();

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [submitted, setSubmitted] = useState(false);

  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { mutateAsync: submitFeedback, isPending: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(InputFeedbackSchema),
    defaultValues: { rating: DEFAULT_RATING, description: "" },
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
            <h2 className="font-semibold text-xl">Thank you!</h2>
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
                      <FormLabel>
                        Rate us ({MIN_RATING}–{MAX_RATING})
                      </FormLabel>
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

type RatingButtonsProps = {
  form: UseFormReturn<FeedbackFormValues>;
  isSubmitting: boolean;
  isExistingFeedback: boolean;
};

export function RatingButtons({
  form,
  isSubmitting,
  isExistingFeedback,
}: RatingButtonsProps) {
  const rating = form.watch("rating");

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {RATING_VALUES.map((value) => {
        const isActive = value <= rating;

        return (
          <ZapButton
            aria-label={`Rate ${value}`}
            className={cn(
              "h-10 w-10 rounded-md p-0 text-sm",
              "transform transition-all duration-200 ease-in-out",
              "hover:scale-110 active:scale-110",
              isActive && "bg-primary text-white"
            )}
            disabled={isSubmitting || isExistingFeedback}
            key={value}
            onClick={() => form.setValue("rating", value)}
            size="sm"
            type="button"
            variant={isActive ? "default" : "outline"}
          >
            {value}
          </ZapButton>
        );
      })}
    </div>
  );
}

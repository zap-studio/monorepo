"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useIsFeedbackSubmitted,
  useSubmitFeedback,
} from "@/hooks/use-feedback";
import { Loader2 } from "lucide-react";
import { FeedbackFormValues, feedbackSchema } from "@/schemas/feedback.schema";
import { useState } from "react";

export default function FeedbackPage() {
  const { isExistingFeedback, setIsExistingFeedback } =
    useIsFeedbackSubmitted();
  const { trigger: submitFeedback, isMutating: isSubmitting } =
    useSubmitFeedback(setIsExistingFeedback);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, description: "" },
  });

  const [submitted, setSubmitted] = useState(false);

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
            <Button
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
            </Button>
          );
        })}
      </div>
    );
  };

  const showThankYouCard = submitted || isExistingFeedback;

  return (
    <div className="px-4">
      {!showThankYouCard && (
        <Card className="animate-fade-in mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
            <CardDescription>
              How likely are you to recommend us to a friend or colleague?
            </CardDescription>
          </CardHeader>
          <CardContent>
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

                <Button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  )}
                  {!isSubmitting && "Submit Feedback"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {showThankYouCard && (
        <Card className="animate-fade-in mx-auto">
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              We appreciate your input and will use it to improve your
              experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            If you have more to share, feel free to reach out anytime.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

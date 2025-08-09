import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { ZapButton } from "@/zap/components/button";
import type { FeedbackFormValues } from "@/zap/types/feedback.types";

interface RatingButtonsProps {
  form: UseFormReturn<FeedbackFormValues>;
  isSubmitting: boolean;
  isExistingFeedback: boolean;
}

export function RatingButtons({
  form,
  isSubmitting,
  isExistingFeedback,
}: RatingButtonsProps) {
  const rating = form.watch("rating");

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {Array.from({ length: 11 }, (_, i) => {
        const isActive = i <= rating;

        return (
          <ZapButton
            aria-label={`Rate ${i}`}
            className={cn(
              "h-10 w-10 rounded-md p-0 text-sm",
              "transform transition-all duration-200 ease-in-out",
              "hover:scale-110 active:scale-110",
              isActive && "bg-primary text-white",
            )}
            disabled={isSubmitting || !!isExistingFeedback}
            key={`rating-${i}`}
            onClick={() => form.setValue("rating", i)}
            size="sm"
            type="button"
            variant={isActive ? "default" : "outline"}
          >
            {i}
          </ZapButton>
        );
      })}
    </div>
  );
}

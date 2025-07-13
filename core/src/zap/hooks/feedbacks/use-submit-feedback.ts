"use client";
import "client-only";

import type React from "react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { useORPC } from "@/zap/stores/orpc.store";
import type { FeedbackFormValues } from "@/zap/types/feedback.types";

export function useSubmitFeedback(
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const orpc = useORPC();

  interface GiveFeedbackArgs {
    key: readonly unknown[];
    arg: { arg: FeedbackFormValues };
  }

  const giveFeedback = (
    _key: GiveFeedbackArgs["key"],
    { arg }: GiveFeedbackArgs["arg"],
  ) => {
    return orpc.feedbacks.submit.call(arg);
  };

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
}

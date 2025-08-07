"use client";
import "client-only";

import type React from "react";

import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
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

  return useZapMutation(orpc.feedbacks.submit.key(), giveFeedback, {
    optimisticData: (current: Record<string, unknown> | undefined) => ({
      ...(current || {}),
    }),
    rollbackOnError: true,
    revalidate: true,
    onSuccess: () => {
      setIsExistingFeedback(true);
    },
    onError: () => {
      setIsExistingFeedback(false);
    },
    successMessage: "Feedback submitted successfully!",
  });
}

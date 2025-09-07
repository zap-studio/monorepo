"use client";
import "client-only";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useZapMutation, useZapQuery } from "@/zap/api/hooks";
import { orpcQuery } from "@/zap/api/lib/orpc";

export function useAverageRating() {
  return useZapQuery(orpcQuery.feedbacks.getAverageRating.queryOptions());
}

export function useUserFeedback() {
  return useZapQuery(orpcQuery.feedbacks.getUserFeedback.queryOptions());
}

export function useSubmitFeedback(
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>
) {
  const queryClient = useQueryClient();

  const getUserFeedbackQueryKey = orpcQuery.feedbacks.getUserFeedback.key();

  return useZapMutation({
    ...orpcQuery.feedbacks.submit.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: getUserFeedbackQueryKey }),
    }),
    onSuccess: () => {
      setIsExistingFeedback(true);
    },
    successMessage: "Feedback submitted successfully!",
  });
}

export function useIsFeedbackSubmitted() {
  const [isExistingFeedback, setIsExistingFeedback] = useState(false);

  const { data: existingFeedback } = useUserFeedback();

  useEffect(() => {
    if (existingFeedback) {
      setIsExistingFeedback(true);
    } else {
      setIsExistingFeedback(false);
    }
  }, [existingFeedback]);

  return { isExistingFeedback, setIsExistingFeedback };
}

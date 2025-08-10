"use client";
import "client-only";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useZapImmutable, useZapMutation, useZapQuery } from "../../api/hooks";
import { orpc } from "../../api/providers/orpc/client";

export function useAverageRating() {
  return useZapImmutable(orpc.feedbacks.getAverageRating.queryOptions());
}

export function useUserFeedback() {
  return useZapQuery(orpc.feedbacks.getUserFeedback.queryOptions());
}

export function useSubmitFeedback(
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const queryClient = useQueryClient();

  const getUserFeedbackQueryKey = orpc.feedbacks.getUserFeedback.key();

  return useZapMutation({
    ...orpc.feedbacks.submit.mutationOptions({
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

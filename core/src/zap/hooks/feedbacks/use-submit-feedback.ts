"use client";
import "client-only";

import { useQueryClient } from "@tanstack/react-query";
import type React from "react";

import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { orpc } from "@/zap/lib/orpc/client";

export function useSubmitFeedback(
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const queryClient = useQueryClient();

  const getUserFeedbackQueryKey = orpc.feedbacks.getUserFeedback.key();

  return useZapMutation({
    ...orpc.feedbacks.submit.mutationOptions(),
    onSuccess: () => {
      setIsExistingFeedback(true);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: getUserFeedbackQueryKey }),
    successMessage: "Feedback submitted successfully!",
  });
}

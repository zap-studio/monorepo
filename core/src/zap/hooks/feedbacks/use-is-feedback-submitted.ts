"use client";
import "client-only";

import { useEffect, useState } from "react";

import { useUserFeedback } from "@/zap/hooks/feedbacks/use-user-feedback";

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

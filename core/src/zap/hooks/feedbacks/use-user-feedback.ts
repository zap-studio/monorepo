"use client";
import "client-only";

import { useZapQuery } from "@/zap/lib/api/hooks/use-zap-query";
import { useORPC } from "@/zap/stores/orpc.store";

export function useUserFeedback() {
  const orpc = useORPC();

  return useZapQuery(
    orpc.feedbacks.getUserFeedback.key(),
    orpc.feedbacks.getUserFeedback.queryOptions().queryFn,
  );
}

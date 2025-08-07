"use client";
import "client-only";

import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";
import { useORPC } from "@/zap/stores/orpc.store";

export function useAverageRating() {
  const orpc = useORPC();

  return useZapImmutable(
    orpc.feedbacks.getAverageRating.key(),
    orpc.feedbacks.getAverageRating.queryOptions().queryFn,
  );
}

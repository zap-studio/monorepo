"use client";
import "client-only";

import { useZapImmutable } from "@/zap/lib/api/hooks/use-zap-immutable";
import { orpc } from "@/zap/lib/orpc/client";

export function useAverageRating() {
  return useZapImmutable(orpc.feedbacks.getAverageRating.queryOptions());
}

"use client";
import "client-only";

import useSWRImmutable from "swr/immutable";

import { useORPC } from "@/zap/stores/orpc.store";

export function useAverageRating() {
  const orpc = useORPC();

  return useSWRImmutable(
    orpc.feedbacks.getAverageRating.key(),
    orpc.feedbacks.getAverageRating.queryOptions().queryFn,
  );
}

"use client";

import useSWR from "swr";

import { useORPC } from "@/zap/stores/orpc.store";

export const useUserFeedback = () => {
  const orpc = useORPC();

  return useSWR(
    orpc.feedbacks.getUserFeedback.key(),
    orpc.feedbacks.getUserFeedback.queryOptions().queryFn,
  );
};

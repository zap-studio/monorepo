"use client";
import "client-only";

import { useZapQuery } from "@/zap/lib/api/hooks/use-zap-query";
import { useORPC } from "@/zap/stores/orpc.store";

export function useExample() {
  const orpc = useORPC();
  return useZapQuery(orpc.example.key(), orpc.example.queryOptions().queryFn);
}

"use client";
import "client-only";

import { useZapQuery } from "@/zap/lib/api/hooks/use-zap-query";
import { orpc } from "@/zap/lib/orpc/client";

export function useExample() {
  return useZapQuery(orpc.example.key(), orpc.example.queryOptions().queryFn);
}

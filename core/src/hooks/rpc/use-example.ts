"use client";
import "client-only";

import { useZapQuery } from "@/zap/api/hooks";
import { orpc } from "@/zap/api/providers/orpc/client";

export function useExample() {
  return useZapQuery(orpc.example.queryOptions({}));
}

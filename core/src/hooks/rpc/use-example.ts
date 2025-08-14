"use client";
import "client-only";

import { useZapQuery } from "@/zap/api/hooks";
import { orpcQuery } from "@/zap/api/providers/orpc/client";

export function useExample() {
  return useZapQuery(orpcQuery.example.queryOptions({}));
}

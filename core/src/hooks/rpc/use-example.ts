"use client";
import "client-only";

import useSWR from "swr";

import { useORPC } from "@/zap/stores/orpc.store";

export function useExample() {
  const orpc = useORPC();
  return useSWR(orpc.example.key(), orpc.example.queryOptions().queryFn);
}

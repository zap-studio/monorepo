"use client";
import "client-only";

import { useZapImmutable } from "@/zap/api/hooks";
import { orpc } from "@/zap/api/providers/orpc/client";

export function useNumberOfUsers() {
  return useZapImmutable(orpc.users.getNumberOfUsers.queryOptions());
}

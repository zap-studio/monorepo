"use client";

import { create } from "zustand";
import { createORPCReactQueryUtils, RouterUtils } from "@orpc/react-query";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCClient } from "@orpc/client";
import { link } from "@/zap/lib/orpc/client";

type RouterClientType = RouterClient<typeof router>;
type ORPCReactUtils = RouterUtils<RouterClient<typeof router>>;

interface ORPCStore {
  orpc: ORPCReactUtils;
}

export const useORPCStore = create<ORPCStore>(() => {
  const client: RouterClientType = createORPCClient(link);
  const orpc = createORPCReactQueryUtils(client);

  return {
    orpc,
  };
});

export function useORPC() {
  const { orpc } = useORPCStore();
  return orpc;
}

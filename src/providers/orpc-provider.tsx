import { createContext, useContext, useState } from "react";
import { createORPCReactQueryUtils, RouterUtils } from "@orpc/react-query";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCClient } from "@orpc/client";
import { link } from "@/lib/orpc";

type ORPCReactUtils = RouterUtils<RouterClient<typeof router>>;

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined);

export default function ORPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState<RouterClient<typeof router>>(() =>
    createORPCClient(link),
  );
  const [orpc] = useState(() => createORPCReactQueryUtils(client));

  return <ORPCContext.Provider value={orpc}>{children}</ORPCContext.Provider>;
}

export function useORPC(): ORPCReactUtils {
  const orpc = useContext(ORPCContext);
  if (!orpc) {
    throw new Error("ORPCContext is not set up properly");
  }
  return orpc;
}

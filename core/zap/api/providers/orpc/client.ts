import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import type { RouterClient } from "@orpc/server";

import type { router } from "../../rpc/router";

export const link = new RPCLink({
  url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/rpc`,
});

export const orpcClient: RouterClient<typeof router> = createORPCClient(link);
export const orpcQuery = createORPCReactQueryUtils(orpcClient);

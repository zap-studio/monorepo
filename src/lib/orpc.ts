import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCReactQueryUtils } from "@orpc/react-query";

export const link = new RPCLink({
  url: "http://localhost:3000/rpc",
  headers: () => ({
    "Content-Type": "application/json",
  }),
});

export const client: RouterClient<typeof router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(client);

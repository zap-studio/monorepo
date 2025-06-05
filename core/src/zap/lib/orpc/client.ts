import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import { router } from "@/rpc/router";
import { createORPCReactQueryUtils } from "@orpc/react-query";
import { BASE_URL } from "@/zap.config";

export const link = new RPCLink({
  url: `${BASE_URL}/rpc`,
});

export const client: RouterClient<typeof router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(client);

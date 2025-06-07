import { RPCHandler, serve } from "@orpc/server/next";

import { router } from "@/rpc/router";

const handler = new RPCHandler(router);

export const { GET, POST, PUT, PATCH, DELETE } = serve(handler, {
  prefix: "/rpc",
  context: async (req: Request) => {
    return {
      headers: req.headers,
    };
  },
});

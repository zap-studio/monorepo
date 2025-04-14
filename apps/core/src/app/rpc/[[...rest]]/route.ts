import { router } from "@/rpc/router";
import { RPCHandler, serve } from "@orpc/server/next";

const handler = new RPCHandler(router);

export const { GET, POST, PUT, PATCH, DELETE } = serve(handler, {
  prefix: "/rpc",
  context: async (req: Request) => {
    return {
      headers: req.headers,
    };
  },
});

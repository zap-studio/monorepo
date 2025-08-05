import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/error-handling/handlers";

export const example = base.use(authMiddleware).handler(
  withRpcHandler(({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const session = context.session;
    return { message: "Hello, World!" };
  }),
);

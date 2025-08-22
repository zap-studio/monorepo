import 'server-only';

import { authMiddleware, base } from '@/rpc/middlewares';
import { withRpcHandler } from '@/zap/errors/handlers';

export const example = base.use(authMiddleware).handler(
  withRpcHandler(({ context }) => {
    const _session = context.session;
    return { message: 'Hello, World!' };
  })
);

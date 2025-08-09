import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/api/handlers";
import {
  getSessionService,
  getUserIdService,
  isAuthenticatedService,
  isUserAdminService,
} from "@/zap/auth/services";

const isAuthenticated = base.handler(withRpcHandler(isAuthenticatedService));
const getUserId = base
  .use(authMiddleware)
  .handler(withRpcHandler(getUserIdService));
const getSession = base
  .use(authMiddleware)
  .handler(withRpcHandler(getSessionService));
const isUserAdmin = base
  .use(authMiddleware)
  .handler(withRpcHandler(isUserAdminService));

export const auth = {
  getUserId,
  getSession,
  isAuthenticated,
  isUserAdmin,
};

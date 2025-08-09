import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import { getSessionService } from "@/zap/services/auth/get-session.service";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";
import { isAuthenticatedService } from "@/zap/services/auth/is-authenticated.service";
import { isUserAdminService } from "@/zap/services/auth/is-user-admin.service";

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

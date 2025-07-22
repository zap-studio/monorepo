import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { getSessionService } from "@/zap/services/auth/get-session.service";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";
import { isAuthenticatedService } from "@/zap/services/auth/is-authenticated.service";
import { isUserAdminService } from "@/zap/services/auth/is-user-admin.service";

const isAuthenticated = base.handler(isAuthenticatedService);
const getUserId = base.use(authMiddleware).handler(getUserIdService);
const getSession = base.use(authMiddleware).handler(getSessionService);
const isUserAdmin = base.use(authMiddleware).handler(isUserAdminService);

export const auth = {
  getUserId,
  getSession,
  isAuthenticated,
  isUserAdmin,
};

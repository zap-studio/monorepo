import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { getSessionAction } from "@/zap/actions/auth/get-session.action";
import { getUserIdAction } from "@/zap/actions/auth/get-user-id";
import { isAuthenticatedAction } from "@/zap/actions/auth/is-authenticated";
import { isUserAdminAction } from "@/zap/actions/auth/is-user-admin";

const isUserAdmin = base.handler(isUserAdminAction);
const getUserId = base.use(authMiddleware).handler(getUserIdAction);
const getSession = base.use(authMiddleware).handler(getSessionAction);
const isAuthenticated = base.handler(isAuthenticatedAction);

export const auth = {
  isUserAdmin,
  getUserId,
  getSession,
  isAuthenticated,
};

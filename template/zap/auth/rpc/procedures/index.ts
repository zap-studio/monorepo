import "server-only";

import { base } from "@/zap/api/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { InputGetUserIdFromMailSchema } from "../../schemas";
import {
  getNumberOfUsersService,
  getSessionService,
  getUserIdFromMailService,
  getUserIdService,
  isAuthenticatedService,
  isUserAdminService,
} from "../../services";
import { $authMiddleware } from "../middlewares";

const $isAuthenticated = (config: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(config)).handler(
    withRpcHandler(async (_opt) => {
      return isAuthenticatedService(config);
    })
  );
const $getUserId = (config: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(config)).handler(
    withRpcHandler(async (_opt) => {
      return getUserIdService(config);
    })
  );
const $getSession = (config: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(config)).handler(
    withRpcHandler(async (_opt) => {
      return getSessionService(config);
    })
  );
const $isUserAdmin = (config: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(config)).handler(
    withRpcHandler(async (_opt) => {
      return isUserAdminService(config);
    })
  );
const getNumberOfUsers = base.handler(withRpcHandler(getNumberOfUsersService));
const getUserIdFromMail = base.input(InputGetUserIdFromMailSchema).handler(
  withRpcHandler(async ({ input }) => {
    return await getUserIdFromMailService({ ...input });
  })
);

export const $auth = (config: Partial<AuthServerPluginConfig>) => {
  return {
    getUserId: $getUserId(config),
    getSession: $getSession(config),
    isAuthenticated: $isAuthenticated(config),
    isUserAdmin: $isUserAdmin(config),
    getNumberOfUsers,
    getUserIdFromMail,
  };
};

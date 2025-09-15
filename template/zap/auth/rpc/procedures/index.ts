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

const $isAuthenticated = (pluginConfig: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(pluginConfig)).handler(
    withRpcHandler((_opt) => {
      return isAuthenticatedService(pluginConfig);
    })
  );
const $getUserId = (pluginConfig: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(pluginConfig)).handler(
    withRpcHandler((_opt) => {
      return getUserIdService(pluginConfig);
    })
  );
const $getSession = (pluginConfig: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(pluginConfig)).handler(
    withRpcHandler((_opt) => {
      return getSessionService(pluginConfig);
    })
  );
const $isUserAdmin = (pluginConfig: Partial<AuthServerPluginConfig>) =>
  base.use($authMiddleware(pluginConfig)).handler(
    withRpcHandler((_opt) => {
      return isUserAdminService(pluginConfig);
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

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

const $isAuthenticated = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .handler(withRpcHandler((_opt) => isAuthenticatedService(pluginConfigs)));
const $getUserId = (pluginConfigs: { auth: Partial<AuthServerPluginConfig> }) =>
  base
    .use($authMiddleware(pluginConfigs))
    .handler(withRpcHandler((_opt) => getUserIdService(pluginConfigs)));
const $getSession = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .handler(withRpcHandler((_opt) => getSessionService(pluginConfigs)));
const $isUserAdmin = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) =>
  base
    .use($authMiddleware(pluginConfigs))
    .handler(withRpcHandler((_opt) => isUserAdminService(pluginConfigs)));
const getNumberOfUsers = base.handler(withRpcHandler(getNumberOfUsersService));
const getUserIdFromMail = base
  .input(InputGetUserIdFromMailSchema)
  .handler(
    withRpcHandler(
      async ({ input }) => await getUserIdFromMailService({ ...input })
    )
  );

export const $auth = (pluginConfigs: {
  auth: Partial<AuthServerPluginConfig>;
}) => ({
  getUserId: $getUserId(pluginConfigs),
  getSession: $getSession(pluginConfigs),
  isAuthenticated: $isAuthenticated(pluginConfigs),
  isUserAdmin: $isUserAdmin(pluginConfigs),
  getNumberOfUsers,
  getUserIdFromMail,
});

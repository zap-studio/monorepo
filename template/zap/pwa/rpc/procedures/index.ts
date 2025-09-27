import "server-only";

import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";
import { InputSubscribeUserSchema } from "../../schemas";
import {
  subscribeUserToPushNotificationsService,
  unsubscribeUserFromPushNotificationsService,
} from "../../services";

const subscribeUserToPushNotifications = base
  .input(InputSubscribeUserSchema)
  .handler(
    withRpcHandler(({ input }) =>
      subscribeUserToPushNotificationsService({ ...input })
    )
  );

const $unsubscribeUserFromPushNotifications = (
  authConfig: Partial<AuthServerPluginConfig>
) =>
  base
    .use($authMiddleware(authConfig))
    .handler(withRpcHandler(unsubscribeUserFromPushNotificationsService));

export const pwa = (authConfig: Partial<AuthServerPluginConfig>) => ({
  subscribeUserToPushNotifications,
  unsubscribeUserFromPushNotifications:
    $unsubscribeUserFromPushNotifications(authConfig),
});

import "server-only";

import { getServerPlugin } from "@/lib/zap.server";
import { base } from "@/zap/api/rpc/middlewares";
import { $authMiddleware } from "@/zap/auth/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import { InputSubscribeUserSchema } from "../../schemas";
import {
  subscribeUserToPushNotificationsService,
  unsubscribeUserFromPushNotificationsService,
} from "../../services";

const authConfig = getServerPlugin("auth").config ?? {};

const subscribeUserToPushNotifications = base
  .input(InputSubscribeUserSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await subscribeUserToPushNotificationsService({ ...input });
    })
  );

const unsubscribeUserFromPushNotifications = base
  .use($authMiddleware(authConfig))
  .handler(withRpcHandler(unsubscribeUserFromPushNotificationsService));

export const pwa = {
  subscribeUserToPushNotifications,
  unsubscribeUserFromPushNotifications,
};

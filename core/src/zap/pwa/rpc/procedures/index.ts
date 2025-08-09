import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/errors/handlers";
import { InputSubscribeUserSchema } from "@/zap/pwa/schemas";
import {
  subscribeUserToPushNotificationsService,
  unsubscribeUserFromPushNotificationsService,
} from "@/zap/pwa/services";

const subscribeUserToPushNotifications = base
  .input(InputSubscribeUserSchema)
  .handler(
    withRpcHandler(async ({ input }) => {
      return await subscribeUserToPushNotificationsService({ ...input });
    }),
  );

const unsubscribeUserFromPushNotifications = base
  .use(authMiddleware)
  .handler(withRpcHandler(unsubscribeUserFromPushNotificationsService));

export const pwa = {
  subscribeUserToPushNotifications,
  unsubscribeUserFromPushNotifications,
};

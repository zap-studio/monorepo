import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { withRpcHandler } from "@/zap/lib/api/handlers";
import { InputSubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";
import { subscribeUserService } from "@/zap/services/push-notifications/subscribe-user.service";
import { unsubscribeUserService } from "@/zap/services/push-notifications/unsubscribe-user.service";

const subscribeUser = base
  .input(InputSubscribeUserSchema)
  .handler(withRpcHandler(subscribeUserService));

const unsubscribeUser = base
  .use(authMiddleware)
  .handler(withRpcHandler(unsubscribeUserService));

export const pushNotifications = {
  subscribeUser,
  unsubscribeUser,
};

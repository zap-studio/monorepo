import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { InputSubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";
import { subscribeUserService } from "@/zap/services/push-notifications/subscribe-user.service";
import { unsubscribeUserService } from "@/zap/services/push-notifications/unsubscribe-user.service";

const subscribeUser = base
  .input(InputSubscribeUserSchema)
  .handler(subscribeUserService);
const unsubscribeUser = base
  .use(authMiddleware)
  .handler(unsubscribeUserService);

export const pushNotifications = {
  subscribeUser,
  unsubscribeUser,
};

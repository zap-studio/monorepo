import "server-only";

import { base } from "@/rpc/middlewares";
import { authMiddleware } from "@/rpc/middlewares";
import { subscribeUserAction } from "@/zap/actions/push-notifications/subscribe-user.action";
import { unsubscribeUserAction } from "@/zap/actions/push-notifications/unsubscribe-user.action";
import { InputSubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";

const subscribeUser = base
  .input(InputSubscribeUserSchema)
  .handler(subscribeUserAction);
const unsubscribeUser = base.use(authMiddleware).handler(unsubscribeUserAction);

export const pushNotifications = {
  subscribeUser,
  unsubscribeUser,
};

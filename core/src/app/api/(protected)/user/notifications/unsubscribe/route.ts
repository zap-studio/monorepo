import "server-only";

import { getAuthenticatedUserId } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { unsubscribeFromPushNotifications } from "@/zap/services/push-notifications.service";

export const DELETE = withApiHandler(async (req: Request) => {
  const userId = await getAuthenticatedUserId(req);
  const result = await unsubscribeFromPushNotifications(userId);
  return Response.json(result, { status: 200 });
});

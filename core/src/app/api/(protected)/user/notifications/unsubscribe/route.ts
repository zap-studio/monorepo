import "server-only";

import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { unsubscribeUserService } from "@/zap/services/push-notifications/unsubscribe-user.service";

export const DELETE = withApiHandler(async () => {
  const result = await unsubscribeUserService();
  return Response.json(result, { status: 200 });
});

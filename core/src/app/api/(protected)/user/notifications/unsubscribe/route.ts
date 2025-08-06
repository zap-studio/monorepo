import "server-only";

import { withAuthenticatedApiHandler } from "@/zap/lib/api/handlers";
import { unsubscribeUserService } from "@/zap/services/push-notifications/unsubscribe-user.service";

export const DELETE = withAuthenticatedApiHandler(async () => {
  const result = await unsubscribeUserService();

  return Response.json(result, { status: 200 });
});

import "server-only";

import { z } from "zod";

import { getAuthenticatedUserId, parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { subscribeToPushNotifications } from "@/zap/services/push-notifications.service";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export const POST = withApiHandler(async (req: Request) => {
  const userId = await getAuthenticatedUserId(req);
  const { subscription } = await parseRequestBody(req, subscribeSchema);
  const result = await subscribeToPushNotifications(userId, subscription);
  return Response.json(result, { status: 200 });
});

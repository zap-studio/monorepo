import "server-only";

import type webpush from "web-push";
import { z } from "zod";

import { withAuthenticatedApiHandler } from "@/zap/lib/api/handlers";
import { parseRequestBody } from "@/zap/lib/api/utils";
import { subscribeUserService } from "@/zap/services/push-notifications/subscribe-user.service";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export const POST = withAuthenticatedApiHandler(async (req: Request) => {
  const { subscription } = await parseRequestBody(req, subscribeSchema);

  const result = await subscribeUserService({
    input: { subscription: subscription as webpush.PushSubscription },
  });

  return Response.json(result, { status: 200 });
});

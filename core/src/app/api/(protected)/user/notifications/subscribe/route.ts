import "server-only";

import type webpush from "web-push";
import { z } from "zod";

import { parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
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

export const POST = withApiHandler(async (req: Request) => {
  const { subscription } = await parseRequestBody(req, subscribeSchema);

  const result = await subscribeUserService({
    input: { subscription: subscription as webpush.PushSubscription },
  });

  return Response.json(result, { status: 200 });
});

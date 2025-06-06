import { z } from "zod/v4";

export const SubscribeUserSchema = z.object({
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      auth: z.string(),
      p256dh: z.string(),
    }),
  }),
});

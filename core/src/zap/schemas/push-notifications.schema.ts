import { z } from "zod/v4";

export const InputSubscribeUserSchema = z.object({
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      auth: z.string(),
      p256dh: z.string(),
    }),
  }),
});

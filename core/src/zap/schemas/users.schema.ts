import { z } from "zod/v4";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

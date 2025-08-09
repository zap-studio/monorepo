import { z } from "zod";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

import z from "zod/v4";

export const WaitlistSchema = z.object({
  email: z.email("Invalid email address"),
});

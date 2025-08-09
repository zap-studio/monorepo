import z from "zod";

export const WaitlistSchema = z.object({
  email: z.email("Invalid email address"),
});

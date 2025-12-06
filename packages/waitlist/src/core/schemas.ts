import z from "zod";

export const EmailSchema: z.ZodEmail = z.email();

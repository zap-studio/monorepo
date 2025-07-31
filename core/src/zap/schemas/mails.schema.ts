import { z } from "zod";

export const InputSendForgotPasswordMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
  url: z.string(),
});

export const InputSendVerificationMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
  url: z.string(),
});

export const InputSendMagicLinkMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
  url: z.string(),
});

export const InputSendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
  react: z.any().optional(),
});

export const InputCanSendMailSchema = z.object({
  userId: z.string(),
});

export const InputUpdateLastTimestampMailSentSchema = z.object({
  userId: z.string(),
});

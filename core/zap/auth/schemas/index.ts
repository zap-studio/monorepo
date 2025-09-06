import z from "zod";

import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

export const LoginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(ZAP_AUTH_CONFIG.MINIMUM_PASSWORD_LENGTH, {
    message: `Password must be at least ${ZAP_AUTH_CONFIG.MINIMUM_PASSWORD_LENGTH} characters.`,
  }),
});

export const RegisterFormSchema = z
  .object({
    name: z
      .string()
      .min(ZAP_AUTH_CONFIG.MINIMUM_USERNAME_LENGTH, {
        message: `Name must be at least ${ZAP_AUTH_CONFIG.MINIMUM_USERNAME_LENGTH} characters.`,
      })
      .max(ZAP_AUTH_CONFIG.MAXIMUM_USERNAME_LENGTH, {
        message: `Name must be at most ${ZAP_AUTH_CONFIG.MAXIMUM_USERNAME_LENGTH} characters.`,
      }),
    email: z.email(),
    password: z
      .string()
      .min(ZAP_AUTH_CONFIG.MINIMUM_PASSWORD_LENGTH, {
        message: `Password must be at least ${ZAP_AUTH_CONFIG.MINIMUM_PASSWORD_LENGTH} characters.`,
      })
      .max(ZAP_AUTH_CONFIG.MAXIMUM_PASSWORD_LENGTH, {
        message: `Password must be at most ${ZAP_AUTH_CONFIG.MAXIMUM_PASSWORD_LENGTH} characters.`,
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

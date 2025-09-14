import z from "zod";

import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

export const $LoginFormSchema = (config: Partial<AuthClientPluginConfig>) => {
  return z.object({
    email: z.email(),
    password: z.string().min(config?.MINIMUM_PASSWORD_LENGTH ?? 8, {
      message: `Password must be at least ${config?.MINIMUM_PASSWORD_LENGTH ?? 8} characters.`,
    }),
  });
};

export const $RegisterFormSchema = (
  config: Partial<AuthClientPluginConfig>
) => {
  return z
    .object({
      name: z
        .string()
        .min(config.MINIMUM_USERNAME_LENGTH ?? 4, {
          message: `Name must be at least ${config.MINIMUM_USERNAME_LENGTH ?? 4} characters.`,
        })
        .max(config.MAXIMUM_USERNAME_LENGTH ?? 50, {
          message: `Name must be at most ${config.MAXIMUM_USERNAME_LENGTH ?? 50} characters.`,
        }),
      email: z.email(),
      password: z
        .string()
        .min(config.MINIMUM_PASSWORD_LENGTH ?? 8, {
          message: `Password must be at least ${config.MINIMUM_PASSWORD_LENGTH ?? 8} characters.`,
        })
        .max(config.MAXIMUM_PASSWORD_LENGTH ?? 100, {
          message: `Password must be at most ${config.MAXIMUM_PASSWORD_LENGTH ?? 100} characters.`,
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });
};

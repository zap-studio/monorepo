import z from "zod";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

export const $LoginFormSchema = (pluginConfigs: {
  auth: Partial<AuthClientPluginConfig>;
}) =>
  z.object({
    email: z.email(),
    password: z
      .string()
      .min(
        pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ??
          DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH,
        {
          message: `Password must be at least ${pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ?? DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH} characters.`,
        }
      ),
  });

export const $RegisterFormSchema = (pluginConfigs: {
  auth: Partial<AuthClientPluginConfig>;
}) =>
  z
    .object({
      name: z
        .string()
        .min(
          pluginConfigs.auth.MINIMUM_USERNAME_LENGTH ??
            DEFAULT_CONFIG.auth.MINIMUM_USERNAME_LENGTH,
          {
            message: `Name must be at least ${pluginConfigs.auth?.MINIMUM_USERNAME_LENGTH ?? DEFAULT_CONFIG.auth.MINIMUM_USERNAME_LENGTH} characters.`,
          }
        )
        .max(
          pluginConfigs?.auth?.MAXIMUM_USERNAME_LENGTH ??
            DEFAULT_CONFIG.auth.MAXIMUM_USERNAME_LENGTH,
          {
            message: `Name must be at most ${pluginConfigs.auth.MAXIMUM_USERNAME_LENGTH ?? DEFAULT_CONFIG.auth.MAXIMUM_USERNAME_LENGTH} characters.`,
          }
        ),
      email: z.email(),
      password: z
        .string()
        .min(
          pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ??
            DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH,
          {
            message: `Password must be at least ${pluginConfigs.auth.MINIMUM_PASSWORD_LENGTH ?? DEFAULT_CONFIG.auth.MINIMUM_PASSWORD_LENGTH} characters.`,
          }
        )
        .max(
          pluginConfigs.auth.MAXIMUM_PASSWORD_LENGTH ??
            DEFAULT_CONFIG.auth.MAXIMUM_PASSWORD_LENGTH,
          {
            message: `Password must be at most ${pluginConfigs.auth.MAXIMUM_PASSWORD_LENGTH ?? DEFAULT_CONFIG.auth.MAXIMUM_PASSWORD_LENGTH} characters.`,
          }
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });

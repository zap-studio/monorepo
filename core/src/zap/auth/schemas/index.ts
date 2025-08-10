import z from "zod";

import { SETTINGS } from "@/lib/settings";

export const InputGetUserIdFromMailSchema = z.object({
  email: z.string(),
});

export const LoginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export const RegisterFormSchema = z
  .object({
    name: z
      .string()
      .min(SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH, {
        message: `Name must be at least ${SETTINGS.AUTH.MINIMUM_USERNAME_LENGTH} characters.`,
      })
      .max(SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH, {
        message: `Name must be at most ${SETTINGS.AUTH.MAXIMUM_USERNAME_LENGTH} characters.`,
      }),
    email: z.email(),
    password: z
      .string()
      .min(SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH, {
        message: `Password must be at least ${SETTINGS.AUTH.MINIMUM_PASSWORD_LENGTH} characters.`,
      })
      .max(SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH, {
        message: `Password must be at most ${SETTINGS.AUTH.MAXIMUM_PASSWORD_LENGTH} characters.`,
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

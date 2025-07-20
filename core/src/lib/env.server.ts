import "server-only";

import { z } from "zod";

const ServerEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_ENV: z.string().optional(),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
  DATABASE_URL_DEV: z
    .string()
    .url({ message: "DATABASE_URL_DEV must be a valid URL" }),
  ENCRYPTION_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const envParseResult = ServerEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_DEV: process.env.DATABASE_URL_DEV,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  ZAP_MAIL: process.env.ZAP_MAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

if (!envParseResult.success) {
  const formattedErrors = envParseResult.error.issues.map((issue) => {
    const { path, message } = issue;
    return `  - ${path.join(".")}: ${message}`;
  });

  const errorMessage = [
    "Invalid server environment variables:",
    ...formattedErrors,
    "\nPlease check your environment configuration (e.g., .env file) and ensure all required variables are set correctly.",
  ].join("\n");

  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const SERVER_ENV = envParseResult.data;

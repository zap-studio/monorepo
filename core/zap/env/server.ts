import "server-only";

import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid URL" }),
  DATABASE_URL_DEV: z
    .url({ message: "DATABASE_URL_DEV must be a valid URL" })
    .optional(),
  ENCRYPTION_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  NEXT_RUNTIME: z.enum(["nodejs", "edge"]).default("nodejs"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_ENV: z
    .enum(["sandbox", "production"], {
      message: "POLAR_ENV must be either 'sandbox' or 'production'",
    })
    .default("sandbox"),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});

const envParseResult = ServerEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_URL_DEV: process.env.DATABASE_URL_DEV,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  NODE_ENV: process.env.NODE_ENV,
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
  POLAR_ENV: process.env.POLAR_ENV,
  POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV,
  ZAP_MAIL: process.env.ZAP_MAIL,
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

  throw new Error(errorMessage);
}

export const SERVER_ENV = envParseResult.data;

import "server-only";

import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid URL" }),
  ENCRYPTION_KEY: z.string().min(1),
  VAPID_PRIVATE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const SERVER_ENV = ServerEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV,
  ZAP_MAIL: process.env.ZAP_MAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

if (!SERVER_ENV.success) {
  const formattedErrors = SERVER_ENV.error.issues.map((issue) => {
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

export const ENV = SERVER_ENV.data;

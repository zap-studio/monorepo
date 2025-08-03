import { z } from "zod";

const ClientEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_ENV: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z
    .string({ message: "NEXT_PUBLIC_VAPID_PUBLIC_KEY must be a valid string" })
    .optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z
    .string({ message: "NEXT_PUBLIC_POSTHOG_KEY must be a valid string" })
    .optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z
    .string({ message: "NEXT_PUBLIC_POSTHOG_HOST must be a valid string" })
    .optional(),
  POLAR_ENV: z.enum(["sandbox", "production"], {
    message: "POLAR_ENV must be either 'sandbox' or 'production'",
  }),
  ZAP_MAIL: z
    .string()
    .email({ message: "ZAP_MAIL must be a valid email address" })
    .optional(),
});

const envParseResult = ClientEnvSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  POLAR_ENV: process.env.POLAR_ENV,
  ZAP_MAIL: process.env.ZAP_MAIL,
});

if (!envParseResult.success) {
  const formattedErrors = envParseResult.error.issues.map((issue) => {
    const { path, message } = issue;
    return `  - ${path.join(".")}: ${message}`;
  });

  const errorMessage = [
    "Invalid client environment variables:",
    ...formattedErrors,
    "\nPlease check your client-side environment configuration (e.g., .env.local or Next.js environment variables) and ensure all required variables are set correctly.",
  ].join("\n");

  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const CLIENT_ENV = envParseResult.data;

// Derived values
export const VERCEL = !!CLIENT_ENV.VERCEL_ENV;
export const DEV = CLIENT_ENV.NODE_ENV !== "production";
export const PROD = CLIENT_ENV.NODE_ENV === "production";

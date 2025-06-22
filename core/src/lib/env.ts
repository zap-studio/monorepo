export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return value;
};

export const warnOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.warn(`Optional environment variable ${name} is not set.`);
  }
  return value;
};

export const ENV = {
  // Required environment variables
  NODE_ENV: requireEnv("NODE_ENV"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  ENCRYPTION_KEY: requireEnv("ENCRYPTION_KEY"),

  // Optional environment variables with fallback values
  VERCEL_ENV: warnOptionalEnv("VERCEL_ENV"),
  ZAP_MAIL: warnOptionalEnv("ZAP_MAIL"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: warnOptionalEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY"),
  VAPID_PRIVATE_KEY: warnOptionalEnv("VAPID_PRIVATE_KEY"),
};

// Derived values
export const VERCEL = !!ENV.VERCEL_ENV;
export const DEV = ENV.NODE_ENV !== "production";

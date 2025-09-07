import { PUBLIC_ENV } from "../public";

export const TEST = PUBLIC_ENV.NODE_ENV === "test";
export const DEV = PUBLIC_ENV.NODE_ENV === "development";
export const PROD = PUBLIC_ENV.NODE_ENV === "production";

export const VERCEL = !!PUBLIC_ENV.VERCEL_ENV;

export const VERCEL_DEVELOPMENT = PUBLIC_ENV.VERCEL_ENV === "development";
export const VERCEL_PREVIEW = PUBLIC_ENV.VERCEL_ENV === "preview";
export const VERCEL_PRODUCTION = PUBLIC_ENV.VERCEL_ENV === "production";

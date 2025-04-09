export const DEV = process.env.NODE_ENV === "development";

export const MINIMUM_USERNAME_LENGTH = 3;
export const MAXIMUM_USERNAME_LENGTH = 20;

export const MINIMUM_PASSWORD_LENGTH = 8;
export const MAXIMUM_PASSWORD_LENGTH = 128;

export const BASE_URL = DEV
  ? "http://localhost:3000"
  : "https://demo.zap-ts.alexandretrotel.org"; // ZAP:TODO - update the production URL

export const EMAIL_RATE_LIMIT_SECONDS = 60; // 60 seconds rate limit

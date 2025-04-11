import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!, // Use the DSN from environment variables
  replaysSessionSampleRate: 0.1, // Sample rate for session replays
  replaysOnErrorSampleRate: 1.0, // Sample rate for session replays on errors

  // Note: If you want to override the automatic release value, do not set a
  // `release` value here. Use the environment variable `SENTRY_RELEASE` so
  // that it will also get attached to your source maps.
});

// Export the function to instrument router transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  beforeSend(event) {
    // Remove apiKey from request body
    if (event.request?.data) {
      if (
        event.request.data &&
        typeof event.request.data === "object" &&
        "apiKey" in event.request.data
      ) {
        delete (event.request.data as { apiKey?: string }).apiKey;
      }
    }
    return event;
  },

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});

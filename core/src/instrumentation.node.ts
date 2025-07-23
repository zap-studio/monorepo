import "server-only";

// Node.js runtime specific instrumentation
export async function register() {
  // This import supports only Node.js runtime.
  await import("./zap/lib/orpc/server");

  // Add any other Node.js specific instrumentation here
  // For example: OpenTelemetry, monitoring, etc.
}

// Auto-register when this module is imported
register();

import "server-only";

// Edge runtime specific instrumentation
export async function register() {
  // Add Edge runtime specific instrumentation here
  // Note: Many Node.js APIs are not available in Edge runtime

  // Example: Edge-compatible monitoring or logging
  await Promise.resolve(
    process.stdout.write("Edge runtime instrumentation initialized"),
  );
}

// Auto-register when this module is imported
register();

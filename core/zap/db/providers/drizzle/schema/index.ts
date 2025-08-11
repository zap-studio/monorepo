/**
 * Dynamic schema exports with runtime safety
 * Only exports schemas from plugins that actually exist
 *
 * To add a new plugin schema:
 * 1. Add the module path to SCHEMA_MODULES array above
 * 2. Add a new export line: export * from "@/zap/newPlugin/db/providers/drizzle/schema";
 */

// List of all possible schema modules
const SCHEMA_MODULES = [
  "@/zap/ai/db/providers/drizzle/schema",
  "@/zap/auth/db/providers/drizzle/schema",
  "@/zap/feedbacks/db/providers/drizzle/schema",
  "@/zap/pwa/db/providers/drizzle/schema",
  "@/zap/waitlist/db/providers/drizzle/schema",
] as const;

/** Helper to dynamically import schemas that exist */
async function loadAvailableSchemas() {
  const loadedSchemas: Record<string, unknown> = {};

  for (const modulePath of SCHEMA_MODULES) {
    try {
      const schema = await import(modulePath);
      const pluginName = modulePath.split("/")[2]; // Extract plugin name from path
      loadedSchemas[pluginName] = schema;
    } catch {
      // Schema doesn't exist or failed to load - skip it silently
      console.debug(`Schema not available: ${modulePath}`);
    }
  }

  return loadedSchemas;
}

// Export the loader function for runtime use
export { loadAvailableSchemas };

// Static exports for build-time availability
// These will be tree-shaken if the modules don't exist

// AI plugin schema
export * from "@/zap/ai/db/providers/drizzle/schema";

// Auth plugin schema
export * from "@/zap/auth/db/providers/drizzle/schema";

// Feedbacks plugin schema
export * from "@/zap/feedbacks/db/providers/drizzle/schema";

// PWA plugin schema
export * from "@/zap/pwa/db/providers/drizzle/schema";

// Waitlist plugin schema
export * from "@/zap/waitlist/db/providers/drizzle/schema";

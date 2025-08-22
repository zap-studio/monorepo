/**
 * This file uses static re-exports to avoid webpack dynamic import warnings.
 * If a plugin doesn't exist, the export will simply fail at build time,
 * but won't cause runtime issues due to tree-shaking.
 *
 * To add a new plugin schema:
 * Add a new export line: export * from "@/zap/newPlugin/db/providers/drizzle/schema";
 *
 * To remove a plugin schema:
 * 1. Remove the export line for the plugin
 * 2. Remove any related code or references
 */

// AI plugin schema
export * from '@/zap/ai/db/providers/drizzle/schema';

// Auth plugin schema
export * from '@/zap/auth/db/providers/drizzle/schema';

// Feedbacks plugin schema
export * from '@/zap/feedbacks/db/providers/drizzle/schema';

// PWA plugin schema
export * from '@/zap/pwa/db/providers/drizzle/schema';

// Waitlist plugin schema
export * from '@/zap/waitlist/db/providers/drizzle/schema';

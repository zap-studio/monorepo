import { userAISettings } from "@/zap/ai/db/providers/drizzle/schema";
import {
  account,
  invitation,
  member,
  organization,
  passkey,
  session,
  twoFactor,
  user,
  verification,
} from "@/zap/auth/db/providers/drizzle/schema";
import { feedback } from "@/zap/feedbacks/db/providers/drizzle/schema";
import { pushNotifications } from "@/zap/pwa/db/providers/drizzle/schema";
import { waitlist } from "@/zap/waitlist/db/providers/drizzle/schema";

/**
 * This file aggregates the Drizzle schemas from various plugins.
 *
 * How to add a plugin schema:
 *  1. Import the plugin table exports explicitly (no namespace imports).
 *  2. Add each table to the `schema` object below.
 *
 * How to remove a plugin schema:
 *  1. Delete its table imports.
 *  2. Remove its entries from the `schema` object.
 *
 * Keep only what you need to reduce type surface & build time.
 */
export const schema = {
  // AI
  userAISettings,

  // Auth
  user,
  session,
  account,
  verification,
  twoFactor,
  passkey,
  organization,
  member,
  invitation,

  // Feedbacks
  feedback,

  // PWA
  pushNotifications,

  // Waitlist
  waitlist,
} as const;

export type DatabaseSchema = typeof schema;

import "server-only";

import { ai } from "@/zap/ai/rpc/procedures";
import { auth } from "@/zap/auth/rpc/procedures";
import { feedbacks } from "@/zap/feedbacks/rpc/procedures";
import { mails } from "@/zap/mails/rpc/procedures";
import { pwa } from "@/zap/pwa/rpc/procedures";
import { waitlist } from "@/zap/waitlist/rpc/procedures";

/**
 * This file aggregates the routers from various plugins.
 *
 * How to add a plugin router:
 *  1. Import the plugin router exports explicitly (no namespace imports).
 *  2. Add each router to the `router` object below.
 *
 * How to remove a plugin router:
 *  1. Delete its router imports.
 *  2. Remove its entries from the `router` object.
 *
 * Keep only what you need to reduce type surface & build time.
 */
export const router = {
  ai,
  auth,
  feedbacks,
  mails,
  pwa,
  waitlist,
};

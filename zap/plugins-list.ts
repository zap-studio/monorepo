import { PluginsMetadata } from "./schemas/plugins.schema";
import { adminDashboardPlugin } from "./plugins/admin-dashboard";
import { aiPlugin } from "./plugins/ai";
import { blogPlugin } from "./plugins/blog";
import { drizzlePlugin } from "./plugins/drizzle";
import { emailsPlugin } from "./plugins/emails";
import { legalPlugin } from "./plugins/legal";
import { polarPlugin } from "./plugins/polar";
import { prismaPlugin } from "./plugins/prisma";
import { pwaPlugin } from "./plugins/pwa";
import { stripePlugin } from "./plugins/stripe";

export const plugins: PluginsMetadata = [
  adminDashboardPlugin,
  aiPlugin,
  blogPlugin,
  drizzlePlugin,
  emailsPlugin,
  legalPlugin,
  polarPlugin,
  prismaPlugin,
  pwaPlugin,
  stripePlugin,
];

import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { getServerPluginConfig } from "@/lib/zap.server";
import { $betterAuthServer } from "@/zap/auth/providers/better-auth/server";

const authConfig = getServerPluginConfig("auth") ?? {};
export const { GET, POST } = toNextJsHandler(
  $betterAuthServer({ auth: authConfig }).handler
);

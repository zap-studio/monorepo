import "server-only";

import { toNextJsHandler } from "better-auth/next-js";
import { getServerPlugin } from "@/lib/zap.server";
import { $betterAuthServer } from "@/zap/auth/providers/better-auth/server";

const config = getServerPlugin("auth").config ?? {};
export const { GET, POST } = toNextJsHandler($betterAuthServer(config).handler);

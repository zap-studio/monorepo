import "server-only";

import { toNextJsHandler } from "better-auth/next-js";

import { betterAuthServer } from "@/zap/auth/providers/better-auth/server";

export const { GET, POST } = toNextJsHandler(betterAuthServer.handler);

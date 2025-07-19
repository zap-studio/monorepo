import "server-only";

import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/zap/lib/auth/server";

export const { GET, POST } = toNextJsHandler(auth.handler);

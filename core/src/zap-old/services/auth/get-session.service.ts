import "server-only";

import { headers } from "next/headers";

import { auth } from "@/zap/lib/auth/server";

export async function getSessionService() {
  const _headers = await headers();
  const result = await auth.api.getSession({ headers: _headers });

  return result?.session;
}

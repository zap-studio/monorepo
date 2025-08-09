import "server-only";

import { getSessionService } from "@/zap/services/auth/get-session.service";

export async function isAuthenticatedService() {
  const session = await getSessionService();

  if (!session) {
    return false;
  }

  return true;
}

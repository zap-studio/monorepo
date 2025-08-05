import "server-only";

import { AuthenticationError } from "@/zap/lib/error-handling/errors";
import { getUserService } from "@/zap/services/auth/get-user.service";

export async function getUserIdService() {
  const user = await getUserService();

  if (!user) {
    throw new AuthenticationError("User not authenticated");
  }

  return user.id;
}

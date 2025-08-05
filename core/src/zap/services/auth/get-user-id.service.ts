import "server-only";

import { getUserService } from "@/zap/services/auth/get-user.service";

export async function getUserIdService() {
  const user = await getUserService();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user.id;
}

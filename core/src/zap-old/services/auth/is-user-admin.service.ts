import "server-only";

import { NotFoundError } from "@/zap/lib/api/errors";

import { getUserService } from "./get-user.service";

export async function isUserAdminService() {
  const user = await getUserService();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return false; // FIXME: Implement actual admin check logic
}

import "server-only";

import { getUserService } from "./get-user.service";

export async function isUserAdminService() {
  const user = await getUserService();

  if (!user) {
    return false;
  }

  return false; // FIXME: Implement actual admin check logic
}

import "server-only";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function getNumberOfUsersService() {
  try {
    const count = await db.$count(user);
    return count;
  } catch {
    return 0;
  }
}

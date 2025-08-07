import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";

export async function unsubscribeUserService() {
  const userId = await getUserIdService();

  await db
    .delete(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .execute();

  return { message: "User unsubscribed successfully" };
}

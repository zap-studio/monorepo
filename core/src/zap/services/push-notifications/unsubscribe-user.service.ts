import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { getUserIdService } from "@/zap/services/auth/get-user-id.service";

export async function unsubscribeUserService() {
  let userId;
  try {
    userId = await getUserIdService();
  } catch {
    throw new Error("Failed to get user ID");
  }

  try {
    await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.userId, userId))
      .execute();
  } catch {
    throw new Error("Failed to unsubscribe user");
  }

  return { success: true, message: "User unsubscribed successfully" };
}

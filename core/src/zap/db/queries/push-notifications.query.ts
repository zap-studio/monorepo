import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const getPushNotificationsByUserQuery = db.query.pushNotifications
  .findFirst({
    where: eq(pushNotifications.userId, sql.placeholder("userId")),
  })
  .prepare("getPushNotificationsByUser");

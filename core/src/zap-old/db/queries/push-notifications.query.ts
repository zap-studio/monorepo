import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";

export const getPushNotificationsByUserQuery = db.query.pushNotifications
  .findFirst({
    where: eq(pushNotifications.userId, sql.placeholder("userId")),
  })
  .prepare("getPushNotificationsByUser");

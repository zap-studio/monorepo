import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "@/zap/db/providers/drizzle";

import { pushNotifications } from "../schema";

export const getPushNotificationsByUserIdQuery = db.query.pushNotifications
  .findFirst({
    where: eq(pushNotifications.userId, sql.placeholder("userId")),
  })
  .prepare("getPushNotificationsByUserId");

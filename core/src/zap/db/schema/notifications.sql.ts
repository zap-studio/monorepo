import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type webpush from "web-push";

import { user } from "@/db/schema";

export const pushNotifications = pgTable("push_notifications", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  subscription: text("jsonb").$type<webpush.PushSubscription>().notNull(),
  userId: text("uuid").references(() => user.id, { onDelete: "cascade" }),
});

export const pushNotificationsUserIndex = uniqueIndex(
  "push_notifications_user_idx",
).on(pushNotifications.userId);

import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import webpush from "web-push";

export const pushNotifications = pgTable("push_notifications", {
  id: uuid("uuid").primaryKey().defaultRandom(),
  subscription: text("jsonb").$type<webpush.PushSubscription>().notNull(),
  userId: text("uuid").references(() => user.id, { onDelete: "cascade" }),
});

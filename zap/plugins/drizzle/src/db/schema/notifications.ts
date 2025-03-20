import { pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import webpush from "web-push";

export const pushNotifications = pgTable("push_notifications", {
  id: text("uuid").primaryKey().default("gen_random_uuid()"),
  subscription: text("jsonb").$type<webpush.PushSubscription>().notNull(),
  userId: text("uuid").references(() => user.id, { onDelete: "cascade" }),
});

import { pgPolicy, pgRole, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { sql } from "drizzle-orm";
import webpush from "web-push";

export const pushNotifications = pgTable(
  "push_notifications",
  {
    id: text("uuid").primaryKey().default("gen_random_uuid()"),
    subscription: text("jsonb").$type<webpush.PushSubscription>().notNull(),
    userId: text("uuid").references(() => user.id, { onDelete: "cascade" }),
  },
  () => [
    pgPolicy("push_notifications_rls", {
      as: "permissive",
      to: pgRole("user"),
      for: "all",
      using: sql`user_id = current_setting('request.jwt.claims.user_id')::uuid`,
    }),
  ],
).enableRLS();

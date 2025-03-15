import { pgPolicy, pgTable, text } from "drizzle-orm/pg-core";

export const pushNotifications = pgTable(
  "push_notifications",
  {
    id: text("uuid").primaryKey().default("gen_random_uuid()"),
    subscription: text("jsonb").$type<PushSubscription>().notNull(),
    userId: text("uuid").references("users").notNull(),
  },
  () => [
    pgPolicy("push_notifications_rls", {
      name: "push_notifications_rls",
      command: "SELECT",
    }),
  ],
).enableRLS();

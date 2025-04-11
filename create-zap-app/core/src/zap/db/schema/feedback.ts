import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "@/db/schema";
import { sql } from "drizzle-orm";

export const feedback = pgTable("feedback", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  description: text("description"),
  submittedAt: timestamp("submitted_at").notNull(),
});

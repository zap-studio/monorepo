import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "@/zap/auth/db/providers/drizzle/schema";

export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  description: text("description"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

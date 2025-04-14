import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userApiKeys = pgTable("user_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  provider: text("provider").notNull(), // e.g. "openai", "mistral"
  encryptedApiKey: text("encrypted_api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

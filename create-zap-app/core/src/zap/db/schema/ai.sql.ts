import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth.sql";

export const userApiKeys = pgTable("user_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  provider: text("provider").notNull(), // e.g. "openai", "mistral"
  encryptedApiKey: jsonb("encrypted_api_key")
    .$type<{
      iv: string;
      encrypted: string;
    }>()
    .notNull(), // Encrypted API key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

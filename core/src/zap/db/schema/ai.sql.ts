import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { ModelName } from "@/zap/types/ai.types";

import { user } from "./auth.sql";

export const userAISettings = pgTable("user_ai_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  provider: text("provider").notNull(), // e.g. "openai", "mistral"
  model: text("model").$type<ModelName>().notNull(), // e.g. "gpt-4o-mini"
  encryptedApiKey: jsonb("encrypted_api_key")
    .$type<{
      iv: string;
      encrypted: string;
    }>()
    .notNull(), // Encrypted API key
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import {
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/zap/auth/db/providers/drizzle/schema";

import type { ModelName } from "../../../../types";

export const userAISettings = pgTable(
  "user_ai_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
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
  },
  (t) => [
    unique("user_ai_settings_user_id_provider_idx").on(t.userId, t.provider),
  ]
);

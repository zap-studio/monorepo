import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { userAISettings } from "@/zap/ai/db/schema";
import { db } from "@/zap/db/providers/drizzle";

export const getApiSettingsForUserAndProviderQuery = db
  .select()
  .from(userAISettings)
  .where(
    and(
      eq(userAISettings.userId, sql.placeholder("userId")),
      eq(userAISettings.provider, sql.placeholder("provider")),
    ),
  )
  .limit(1)
  .prepare("getApiSettingsForUserAndProvider");

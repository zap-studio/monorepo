import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

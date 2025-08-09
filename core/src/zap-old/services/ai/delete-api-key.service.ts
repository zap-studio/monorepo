import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import type { AIProviderId } from "@/zap/types/ai.types";

interface DeleteAPIKeyService {
  userId: string;
  provider: AIProviderId;
}

export async function deleteAPIKeyService({
  userId,
  provider,
}: DeleteAPIKeyService) {
  await db
    .delete(userAISettings)
    .where(
      and(
        eq(userAISettings.userId, userId),
        eq(userAISettings.provider, provider),
      ),
    )
    .execute();

  return { message: "API key deleted successfully." };
}

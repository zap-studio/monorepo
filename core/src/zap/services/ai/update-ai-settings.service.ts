import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { NotFoundError } from "@/zap/lib/api/errors";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface UpdateAISettingsContext {
  session: { user: { id: string } };
}
interface UpdateAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function updateAISettingsService({
  context,
  input,
}: {
  context: UpdateAISettingsContext;
  input: UpdateAISettingsInput;
}) {
  const userId = context.session.user.id;
  const provider = input.provider;
  const model = input.model;
  const apiKey = input.apiKey;

  const encryptedAPIKey = await encrypt(apiKey, encryptionKeyHex);

  const existingSettings = await getApiSettingsForUserAndProviderQuery.execute({
    userId,
    provider,
  });

  if (!existingSettings.length) {
    throw new NotFoundError("AI settings not found");
  }

  await db
    .update(userAISettings)
    .set({
      model,
      encryptedApiKey: encryptedAPIKey,
    })
    .where(
      and(
        eq(userAISettings.userId, userId),
        eq(userAISettings.provider, provider),
      ),
    )
    .execute();

  return { success: true };
}

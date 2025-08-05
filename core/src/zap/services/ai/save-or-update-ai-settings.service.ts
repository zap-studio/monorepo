import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface SaveOrUpdateAISettingsContext {
  session: { user: { id: string } };
}
interface SaveOrUpdateAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveOrUpdateAISettingsService({
  context,
  input,
}: {
  context: SaveOrUpdateAISettingsContext;
  input: SaveOrUpdateAISettingsInput;
}) {
  const userId = context.session.user.id;
  const provider = input.provider;
  const apiKey = input.apiKey;
  const model = input.model;

  let encryptedAPIKey;
  try {
    encryptedAPIKey = await encrypt(apiKey, encryptionKeyHex);
  } catch {
    throw new Error("Failed to encrypt API key");
  }

  let existingSettings;
  try {
    existingSettings = await getApiSettingsForUserAndProviderQuery.execute({
      userId,
      provider,
    });
  } catch {
    throw new Error("Failed to get AI settings");
  }

  if (existingSettings.length > 0) {
    try {
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
    } catch {
      throw new Error("Failed to update AI settings");
    }
  } else {
    try {
      await db
        .insert(userAISettings)
        .values({
          userId,
          provider,
          model,
          encryptedApiKey: encryptedAPIKey,
        })
        .execute();
    } catch {
      throw new Error("Failed to save AI settings");
    }
  }

  return { success: true };
}

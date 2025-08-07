import "server-only";

import { db, type UpsertMode } from "@/db";
import { userAISettings } from "@/db/schema";
import { BadRequestError } from "@/zap/lib/api/errors";
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
  mode = "upsert",
}: {
  context: SaveOrUpdateAISettingsContext;
  input: SaveOrUpdateAISettingsInput;
  mode?: UpsertMode;
}) {
  const userId = context.session.user.id;
  const { provider, apiKey, model } = input;

  const encryptedAPIKey = await encrypt(apiKey, encryptionKeyHex);

  const values = {
    userId,
    provider,
    model,
    encryptedApiKey: encryptedAPIKey,
  };

  if (mode === "create-only") {
    const result = await db
      .insert(userAISettings)
      .values(values)
      .onConflictDoNothing({
        target: [userAISettings.userId, userAISettings.provider],
      })
      .returning({ id: userAISettings.id });

    if (!result.length) {
      throw new BadRequestError("AI settings already exist for this provider");
    }

    return { success: true };
  }

  if (mode === "update-only") {
    await db
      .insert(userAISettings)
      .values(values)
      .onConflictDoUpdate({
        target: [userAISettings.userId, userAISettings.provider],
        set: {
          model,
          encryptedApiKey: encryptedAPIKey,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  }

  await db
    .insert(userAISettings)
    .values(values)
    .onConflictDoUpdate({
      target: [userAISettings.userId, userAISettings.provider],
      set: {
        model,
        encryptedApiKey: encryptedAPIKey,
        updatedAt: new Date(),
      },
    });

  return { success: true };
}

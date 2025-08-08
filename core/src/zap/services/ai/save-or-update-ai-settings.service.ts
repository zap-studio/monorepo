import "server-only";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import type { UpsertMode } from "@/db/types";
import { BadRequestError } from "@/zap/lib/api/errors";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface SaveOrUpdateAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
  mode: UpsertMode;
}

export async function saveOrUpdateAISettingsService({
  userId,
  provider,
  apiKey,
  model,
  mode = "upsert",
}: SaveOrUpdateAISettingsService) {
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

    return {
      message: "AI settings created successfully.",
      data: {
        id: result[0].id,
      },
    };
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

    return { message: "AI settings updated successfully." };
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

  return { message: "AI settings saved successfully." };
}

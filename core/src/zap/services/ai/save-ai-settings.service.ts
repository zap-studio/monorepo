import "server-only";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import {
  DatabaseError,
  InternalServerError,
  ValidationError,
} from "@/zap/lib/error-handling/errors";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface SaveAISettingsContext {
  session: { user: { id: string } };
}
interface SaveAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveAISettingsService({
  context,
  input,
}: {
  context: SaveAISettingsContext;
  input: SaveAISettingsInput;
}) {
  const userId = context.session.user.id;
  const provider = input.provider;
  const apiKey = input.apiKey;
  const model = input.model;

  const encryptedAPIKey = await encrypt(apiKey, encryptionKeyHex).catch(
    (error) => {
      throw new InternalServerError("Failed to encrypt API key", error);
    },
  );

  const existingSettings = await getApiSettingsForUserAndProviderQuery
    .execute({
      userId,
      provider,
    })
    .catch((error) => {
      throw new DatabaseError(
        "Failed to fetch existing AI settings",
        "READ",
        error,
      );
    });

  if (existingSettings.length > 0) {
    throw new ValidationError("AI settings already exists");
  }

  await db
    .insert(userAISettings)
    .values({
      userId,
      provider,
      model,
      encryptedApiKey: encryptedAPIKey,
    })
    .execute()
    .catch((error) => {
      throw new DatabaseError("Failed to save AI settings", "CREATE", error);
    });

  return { success: true };
}

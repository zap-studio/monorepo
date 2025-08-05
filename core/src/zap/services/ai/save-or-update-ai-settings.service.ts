import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import {
  DatabaseError,
  InternalServerError,
} from "@/zap/lib/error-handling/errors";
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
      throw new DatabaseError("Failed to get AI settings", "READ", error);
    });

  if (existingSettings.length > 0) {
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
      .execute()
      .catch((error) => {
        throw new DatabaseError(
          "Failed to update AI settings",
          "UPDATE",
          error,
        );
      });
  } else {
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
        throw new DatabaseError(
          "Failed to create AI settings",
          "CREATE",
          error,
        );
      });
  }

  return { success: true };
}

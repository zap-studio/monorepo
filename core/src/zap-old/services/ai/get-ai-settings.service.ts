import "server-only";

import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { decrypt } from "@/zap/lib/crypto/decrypt";
import type { AIProviderId } from "@/zap/types/ai.types";

interface GetAISettingsService {
  userId: string;
  provider: AIProviderId;
}

export async function getAISettingsService({
  userId,
  provider,
}: GetAISettingsService) {
  const result = await getApiSettingsForUserAndProviderQuery.execute({
    userId,
    provider,
  });

  if (!result.length) {
    return null;
  }

  const encryptedAPIKey = result[0]?.encryptedApiKey;
  const model = result[0]?.model;

  const decryptedAPIKey = await decrypt(
    encryptedAPIKey.iv,
    encryptedAPIKey.encrypted,
    encryptionKeyHex,
  );

  return { apiKey: decryptedAPIKey, model };
}

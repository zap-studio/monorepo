import "server-only";

import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { decrypt } from "@/zap/lib/crypto/decrypt";
import { NotFoundError } from "@/zap/lib/error-handling/errors";
import type { AIProviderId } from "@/zap/types/ai.types";

interface GetAISettingsContext {
  session: { user: { id: string } };
}
interface GetAISettingsInput {
  provider: AIProviderId;
}

export async function getAISettingsService({
  context,
  input,
}: {
  context: GetAISettingsContext;
  input: GetAISettingsInput;
}) {
  const userId = context.session.user.id;
  const provider = input.provider;

  const result = await getApiSettingsForUserAndProviderQuery.execute({
    userId,
    provider,
  });

  if (!result.length) {
    throw new NotFoundError("AI settings not found");
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

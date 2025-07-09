"use server";
import "server-only";

import { Effect } from "effect";

import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { decrypt } from "@/zap/lib/crypto/decrypt";
import type { AIProviderId } from "@/zap/types/ai.types";

interface GetAISettingsContext {
  session: { user: { id: string } };
}
interface GetAISettingsInput {
  provider: AIProviderId;
}

export async function getAISettingsAction({
  context,
  input,
}: {
  context: GetAISettingsContext;
  input: GetAISettingsInput;
}) {
  const effect = Effect.gen(function* (_) {
    const userId = context.session.user.id;
    const provider = input.provider;

    const result = yield* _(
      Effect.tryPromise({
        try: () =>
          getApiSettingsForUserAndProviderQuery.execute({
            userId,
            provider,
          }),
        catch: () => new Error("Failed to get AI settings"),
      }),
    );

    if (!result.length) {
      return yield* _(Effect.fail(new Error("AI settings not found")));
    }

    const encryptedAPIKey = result[0]?.encryptedApiKey;
    const model = result[0]?.model;

    const decryptedAPIKey = yield* _(
      Effect.tryPromise({
        try: () =>
          decrypt(
            encryptedAPIKey.iv,
            encryptedAPIKey.encrypted,
            encryptionKeyHex,
          ),
        catch: () => new Error("Failed to decrypt API key"),
      }),
    );

    return { apiKey: decryptedAPIKey, model };
  });

  return await Effect.runPromise(effect);
}

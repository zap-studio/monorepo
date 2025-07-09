"use server";
import "server-only";

import { Effect } from "effect";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { encryptionKeyHex } from "@/zap/lib/crypto";
import { encrypt } from "@/zap/lib/crypto/encrypt";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface SaveAISettingsContext {
  session: { user: { id: string } };
}
interface SaveAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveAISettingsAction({
  context,
  input,
}: {
  context: SaveAISettingsContext;
  input: SaveAISettingsInput;
}) {
  const effect = Effect.gen(function* (_) {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;
    const model = input.model;

    const encryptedAPIKey = yield* _(
      Effect.tryPromise({
        try: () => encrypt(apiKey, encryptionKeyHex),
        catch: () => new Error("Failed to encrypt API key"),
      }),
    );

    const existingSettings = yield* _(
      Effect.tryPromise({
        try: () =>
          getApiSettingsForUserAndProviderQuery.execute({
            userId,
            provider,
          }),
        catch: () => new Error("Failed to get AI settings"),
      }),
    );

    if (existingSettings.length > 0) {
      return yield* _(Effect.fail(new Error("AI settings already exists")));
    }

    yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .insert(userAISettings)
            .values({
              userId,
              provider,
              model,
              encryptedApiKey: encryptedAPIKey,
            })
            .execute(),
        catch: () => new Error("Failed to save AI settings"),
      }),
    );

    return { success: true };
  });

  return await Effect.runPromise(effect);
}

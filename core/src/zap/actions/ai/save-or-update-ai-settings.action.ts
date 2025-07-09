"use server";
import "server-only";

import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

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

export async function saveOrUpdateAISettingsAction({
  context,
  input,
}: {
  context: SaveOrUpdateAISettingsContext;
  input: SaveOrUpdateAISettingsInput;
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
      yield* _(
        Effect.tryPromise({
          try: () =>
            db
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
              .execute(),
          catch: () => new Error("Failed to update AI settings"),
        }),
      );
    } else {
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
    }

    return { success: true };
  });

  return await Effect.runPromise(effect);
}

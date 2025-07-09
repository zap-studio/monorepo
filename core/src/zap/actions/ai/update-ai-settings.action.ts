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

interface UpdateAISettingsContext {
  session: { user: { id: string } };
}
interface UpdateAISettingsInput {
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function updateAISettingsAction({
  context,
  input,
}: {
  context: UpdateAISettingsContext;
  input: UpdateAISettingsInput;
}) {
  const effect = Effect.gen(function* (_) {
    const userId = context.session.user.id;
    const provider = input.provider;
    const model = input.model;
    const apiKey = input.apiKey;

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

    if (!existingSettings.length) {
      return yield* _(Effect.fail(new Error("AI settings not found")));
    }

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

    return { success: true };
  });

  return await Effect.runPromise(effect);
}

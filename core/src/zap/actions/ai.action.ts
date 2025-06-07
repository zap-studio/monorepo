"use server";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/zap/lib/crypto/crypto";
import { AIProviderId } from "@/zap/types/ai.types";
import { Effect, pipe } from "effect";

export type AISettingsResult = {
  apiKey: string;
  model: string;
};

const queryAISettings = (userId: string, provider: AIProviderId) =>
  Effect.tryPromise({
    try: () =>
      db
        .select()
        .from(userAISettings)
        .where(
          and(
            eq(userAISettings.userId, userId),
            eq(userAISettings.provider, provider),
          ),
        )
        .limit(1),
    catch: (e) => e,
  });

const decryptApiKey = (iv: string, encrypted: string) =>
  Effect.try({
    try: () => decrypt(iv, encrypted),
    catch: (e) => e,
  });

export const getAISettings = (userId: string, provider: AIProviderId) =>
  pipe(
    queryAISettings(userId, provider),

    Effect.flatMap((records) => {
      const record = records[0];

      if (!record) {
        return Effect.fail(
          new Error(
            `AI settings not found for user ${userId} and provider ${provider}`,
          ),
        );
      }

      return Effect.succeed(record);
    }),

    Effect.flatMap((record) => {
      const { iv, encrypted } = record.encryptedApiKey;

      return pipe(
        decryptApiKey(iv, encrypted),
        Effect.map((apiKey) => ({
          apiKey,
          model: record.model,
        })),
      );
    }),
  );

export const getAISettingsWithErrorHandling = async (
  userId: string,
  provider: AIProviderId,
) => {
  return Effect.runPromise(
    pipe(
      getAISettings(userId, provider),
      Effect.map((data) => ({ success: true, data })),
      Effect.catchAll((error) => Effect.succeed({ success: false, error })),
    ),
  );
};

"use server";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "../lib/crypto/crypto";
import { AIProviderId } from "../types/ai.types";
import { Effect } from "effect";

export const getAISettings = async (userId: string, provider: AIProviderId) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const apiKeyRecords = yield* _(
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
              .limit(1)
              .execute(),
          catch: (e) => e,
        }),
      );

      const apiKeyRecord = apiKeyRecords[0];
      if (!apiKeyRecord) {
        return yield* _(Effect.fail(new Error("API key not found")));
      }

      const { iv, encrypted } = apiKeyRecord.encryptedApiKey;
      const apiKey = decrypt(iv, encrypted);
      const model = apiKeyRecord.model;

      return { apiKey, model };
    }),
  );
};

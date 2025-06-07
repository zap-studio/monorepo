"use server";

import { decrypt } from "../lib/crypto/crypto";
import { AIProviderId } from "@/zap/types/ai.types";
import { Effect } from "effect";
import { getApiSettingsForUserAndProviderQuery } from "../db/queries/ai.query";

export const getAISettings = async (userId: string, provider: AIProviderId) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const apiKeyRecords = yield* _(
        Effect.tryPromise({
          try: () =>
            getApiSettingsForUserAndProviderQuery.execute({
              userId,
              provider,
            }),
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

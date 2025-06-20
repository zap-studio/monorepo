"use server";
import "server-only";

import { Effect } from "effect";

import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
import { decrypt } from "@/zap/lib/crypto/decrypt";
import type { AIProviderId } from "@/zap/types/ai.types";

interface GetAISettingsContext {
  session: { user: { id: string } };
}
interface GetAISettingsInput {
  provider: AIProviderId;
}

export const getAISettingsAction = async ({
  context,
  input,
}: {
  context: GetAISettingsContext;
  input: GetAISettingsInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;
      const provider = input.provider;

      const result = yield* _(
        Effect.tryPromise({
          try: () =>
            getApiSettingsForUserAndProviderQuery.execute({
              userId,
              provider,
            }),
          catch: (e) => e,
        }),
      );

      if (!result.length) {
        return yield* _(Effect.fail(new Error("AI settings not found")));
      }

      const encryptedAPIKey = result[0]?.encryptedApiKey;
      const model = result[0]?.model;

      const decryptedAPIKey = decrypt(
        encryptedAPIKey.iv,
        encryptedAPIKey.encrypted,
      );

      return { apiKey: decryptedAPIKey, model };
    }),
  );
};

import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
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

export const saveOrUpdateAISettingsAction = async ({
  context,
  input,
}: {
  context: SaveOrUpdateAISettingsContext;
  input: SaveOrUpdateAISettingsInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;
      const provider = input.provider;
      const apiKey = input.apiKey;
      const model = input.model;

      const encryptedAPIKey = encrypt(apiKey);

      const existingSettings = yield* _(
        Effect.tryPromise({
          try: () =>
            getApiSettingsForUserAndProviderQuery.execute({
              userId,
              provider,
            }),
          catch: (e) => e,
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
            catch: (e) => e,
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
            catch: (e) => e,
          }),
        );
      }

      return { success: true };
    }),
  );
};

import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";
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

export const updateAISettingsAction = async ({
  context,
  input,
}: {
  context: UpdateAISettingsContext;
  input: UpdateAISettingsInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;
      const provider = input.provider;
      const model = input.model;
      const apiKey = input.apiKey;

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
          catch: (e) => e,
        }),
      );

      return { success: true };
    }),
  );
};

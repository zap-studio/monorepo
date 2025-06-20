"use server";
import "server-only";

import { and, eq } from "drizzle-orm";
import { Effect } from "effect";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import type { AIProviderId } from "@/zap/types/ai.types";

interface DeleteAPIKeyContext {
  session: { user: { id: string } };
}
interface DeleteAPIKeyInput {
  provider: AIProviderId;
}

export const deleteAPIKeyAction = async ({
  context,
  input,
}: {
  context: DeleteAPIKeyContext;
  input: DeleteAPIKeyInput;
}) => {
  return Effect.runPromise(
    Effect.gen(function* (_) {
      const userId = context.session.user.id;
      const provider = input.provider;

      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .delete(userAISettings)
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

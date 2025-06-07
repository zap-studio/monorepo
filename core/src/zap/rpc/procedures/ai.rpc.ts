import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { authMiddleware, base } from "@/rpc/middlewares";
import { decrypt, encrypt } from "@/zap/lib/crypto/crypto";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { and, eq } from "drizzle-orm";
import { $fetch } from "@/lib/fetch";
import { z } from "zod/v4";
import { Effect } from "effect";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/db/queries/ai.query";

const InputGetAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
});

const getAISettings = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(async ({ context, input }) => {
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
  });

const InputSaveAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
});

const saveAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
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
            catch: (e) => e,
          }),
        );

        return { success: true };
      }),
    );
  });

const InputUpdateAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
});

const updateAISettings = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(async ({ context, input }) => {
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
  });

const InputDeleteAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
});

const deleteAPIKey = base
  .use(authMiddleware)
  .input(InputDeleteAPIKeySchema)
  .handler(async ({ context, input }) => {
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
  });

const saveOrUpdateAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
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
  });

const InputTestAPIKeySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(({ input, context }) => {
    return Effect.runPromise(
      Effect.gen(function* (_) {
        const provider = input.provider;
        const apiKey = input.apiKey;
        const model = input.model;
        const headers = new Headers(context.headers);

        headers.delete("content-length");
        headers.delete("content-type");

        yield* _(
          Effect.tryPromise({
            try: () =>
              $fetch(`/api/ai/test`, {
                method: "POST",
                body: { provider, apiKey, model },
                headers,
              }),
            catch: () => new Error("Invalid API key"),
          }),
        );

        return { success: true };
      }),
    );
  });

export const ai = {
  getAISettings,
  saveAISettings,
  updateAISettings,
  deleteAPIKey,
  saveOrUpdateAISettings,
  testAPIKey,
};

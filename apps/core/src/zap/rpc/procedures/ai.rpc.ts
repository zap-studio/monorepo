import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { authMiddleware, base } from "@/rpc/middlewares";
import { BASE_URL } from "@/zap.config";
import { decrypt, encrypt } from "@/zap/lib/crypto";
import { AIProviderEnumSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { and, eq } from "drizzle-orm";
import ky from "ky";
import { z } from "zod";

const InputGetAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
});

const getAISettings = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;

    const result = await db
      .select()
      .from(userAISettings)
      .where(
        and(
          eq(userAISettings.userId, userId),
          eq(userAISettings.provider, provider),
        ),
      )
      .limit(1)
      .execute();

    if (!result.length) {
      throw new Error("AI settings not found");
    }

    const encryptedAPIKey = result[0]?.encryptedApiKey;
    const model = result[0]?.model;

    const decryptedAPIKey = decrypt(
      encryptedAPIKey.iv,
      encryptedAPIKey.encrypted,
    );

    return { apiKey: decryptedAPIKey, model };
  });

const InputSaveAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
});

const saveAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;
    const model = input.model;

    const encryptedAPIKey = encrypt(apiKey);

    const existingSettings = await db
      .select()
      .from(userAISettings)
      .where(
        and(
          eq(userAISettings.userId, userId),
          eq(userAISettings.provider, provider),
        ),
      )
      .limit(1)
      .execute();

    if (existingSettings.length > 0) {
      throw new Error("AI settings already exists");
    }

    await db.insert(userAISettings).values({
      userId,
      provider,
      model,
      encryptedApiKey: encryptedAPIKey,
    });

    return { success: true };
  });

const InputUpdateAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
  model: ModelNameSchema,
  apiKey: z.string(),
});

const updateAISettings = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const model = input.model;
    const apiKey = input.apiKey;

    const encryptedAPIKey = encrypt(apiKey);

    const existingSettings = await db.select().from(userAISettings);

    if (!existingSettings.length) {
      throw new Error("AI settings not found");
    }

    await db
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
      );

    return { success: true };
  });

const InputDeleteAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
});

const deleteAPIKey = base
  .use(authMiddleware)
  .input(InputDeleteAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;

    await db
      .delete(userAISettings)
      .where(
        and(
          eq(userAISettings.userId, userId),
          eq(userAISettings.provider, provider),
        ),
      );

    return { success: true };
  });

const saveOrUpdateAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;
    const model = input.model;

    const encryptedAPIKey = encrypt(apiKey);

    const existingSettings = await db
      .select()
      .from(userAISettings)
      .where(
        and(
          eq(userAISettings.userId, userId),
          eq(userAISettings.provider, provider),
        ),
      )
      .limit(1)
      .execute();

    if (existingSettings.length > 0) {
      await db
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
        );
    } else {
      await db.insert(userAISettings).values({
        userId,
        provider,
        model,
        encryptedApiKey: encryptedAPIKey,
      });
    }

    return { success: true };
  });

const InputTestAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(async ({ input, context }) => {
    const provider = input.provider;
    const apiKey = input.apiKey;
    const model = input.model;
    const headers = new Headers(context.headers);
    headers.delete("content-length");
    headers.delete("content-type");

    try {
      await ky.post(`${BASE_URL}/api/ai/test`, {
        json: {
          provider,
          apiKey,
          model,
        },
        headers,
      });
    } catch (error) {
      console.error(error);
      throw new Error("Invalid API key");
    }

    return { success: true };
  });

export const ai = {
  getAISettings,
  saveAISettings,
  updateAISettings,
  deleteAPIKey,
  saveOrUpdateAISettings,
  testAPIKey,
};

import { db } from "@/db";
import { userApiKeys } from "@/db/schema";
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

const getAPIKey = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;

    const apiKeys = await db
      .select()
      .from(userApiKeys)
      .where(
        and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
      )
      .limit(1)
      .execute();

    const encryptedAPIKey = apiKeys[0]?.encryptedApiKey;
    if (!encryptedAPIKey) {
      throw new Error("API key not found");
    }

    const decryptedAPIKey = decrypt(
      encryptedAPIKey.iv,
      encryptedAPIKey.encrypted,
    );

    return decryptedAPIKey;
  });

const InputSaveAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
  apiKey: z.string(),
});

const saveAPIKey = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;
    const encryptedAPIKey = encrypt(apiKey);

    const existingKey = await db
      .select()
      .from(userApiKeys)
      .where(
        and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
      )
      .limit(1)
      .execute();

    if (existingKey.length > 0) {
      throw new Error("API key already exists for this provider");
    }

    await db.insert(userApiKeys).values({
      userId,
      provider,
      encryptedApiKey: encryptedAPIKey,
    });

    return { success: true };
  });

const InputUpdateAPIKeySchema = z.object({
  provider: AIProviderEnumSchema,
  apiKey: z.string(),
});

const updateAPIKey = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;

    const encryptedAPIKey = encrypt(apiKey);

    await db
      .update(userApiKeys)
      .set({
        encryptedApiKey: encryptedAPIKey,
      })
      .where(
        and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
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
      .delete(userApiKeys)
      .where(
        and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
      );

    return { success: true };
  });

const saveOrUpdateAPIKey = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;
    const provider = input.provider;
    const apiKey = input.apiKey;
    const encryptedAPIKey = encrypt(apiKey);

    const existingKey = await db
      .select()
      .from(userApiKeys)
      .where(
        and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
      )
      .limit(1)
      .execute();

    if (existingKey.length > 0) {
      await db
        .update(userApiKeys)
        .set({
          encryptedApiKey: encryptedAPIKey,
        })
        .where(
          and(
            eq(userApiKeys.userId, userId),
            eq(userApiKeys.provider, provider),
          ),
        );
    } else {
      await db.insert(userApiKeys).values({
        userId,
        provider,
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
  getAPIKey,
  saveAPIKey,
  updateAPIKey,
  deleteAPIKey,
  saveOrUpdateAPIKey,
  testAPIKey,
};

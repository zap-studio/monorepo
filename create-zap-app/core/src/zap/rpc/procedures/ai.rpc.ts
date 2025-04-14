import { db } from "@/db";
import { userApiKeys } from "@/db/schema";
import { authMiddleware, base } from "@/rpc/middlewares";
import { getAPIKey as getAPIKeyAction } from "@/zap/actions/ai.action";
import { encrypt } from "@/zap/lib/crypto";
import { AIProviderEnumSchema } from "@/zap/schemas/ai.schema";
import { and, eq } from "drizzle-orm";
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

    const apiKey = await getAPIKeyAction(userId, provider);
    return apiKey;
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
      encryptedApiKey: encryptedAPIKey.encrypted,
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
        encryptedApiKey: encryptedAPIKey.encrypted,
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
          encryptedApiKey: encryptedAPIKey.encrypted,
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
        encryptedApiKey: encryptedAPIKey.encrypted,
      });
    }

    return { success: true };
  });

export const ai = {
  getAPIKey,
  saveAPIKey,
  updateAPIKey,
  deleteAPIKey,
  saveOrUpdateAPIKey,
};

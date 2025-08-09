import "server-only";

import { streamToEventIterator } from "@orpc/server";
import {
  convertToModelMessages,
  generateText,
  streamText,
  UIMessage,
} from "ai";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { UpsertMode } from "@/db/types";
import { SETTINGS } from "@/lib/settings";
import { getApiSettingsForUserAndProviderQuery } from "@/zap/ai/db/queries";
import { userAISettings } from "@/zap/ai/db/schema";
import { getModel } from "@/zap/ai/lib";
import { AIProviderId, ModelName } from "@/zap/ai/types";
import { BadRequestError } from "@/zap/errors";
import { encryptionKeyHex } from "@/zap-old/lib/crypto";
import { decrypt } from "@/zap-old/lib/crypto/decrypt";
import { encrypt } from "@/zap-old/lib/crypto/encrypt";

interface GetAISettingsService {
  userId: string;
  provider: AIProviderId;
}

export async function getAISettingsService({
  userId,
  provider,
}: GetAISettingsService) {
  const result = await getApiSettingsForUserAndProviderQuery.execute({
    userId,
    provider,
  });

  if (!result.length) {
    return null;
  }

  const encryptedAPIKey = result[0]?.encryptedApiKey;
  const model = result[0]?.model;

  const decryptedAPIKey = await decrypt(
    encryptedAPIKey.iv,
    encryptedAPIKey.encrypted,
    encryptionKeyHex,
  );

  return { apiKey: decryptedAPIKey, model };
}

interface DeleteAPIKeyService {
  userId: string;
  provider: AIProviderId;
}

export async function deleteAPIKeyService({
  userId,
  provider,
}: DeleteAPIKeyService) {
  await db
    .delete(userAISettings)
    .where(
      and(
        eq(userAISettings.userId, userId),
        eq(userAISettings.provider, provider),
      ),
    )
    .execute();

  return { message: "API key deleted successfully." };
}

interface SaveAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function saveAISettingsService({
  userId,
  provider,
  model,
  apiKey,
}: SaveAISettingsService) {
  return await saveOrUpdateAISettingsService({
    userId,
    provider,
    model,
    apiKey,
    mode: "create-only",
  });
}

interface SaveOrUpdateAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
  mode: UpsertMode;
}

export async function saveOrUpdateAISettingsService({
  userId,
  provider,
  apiKey,
  model,
  mode = "upsert",
}: SaveOrUpdateAISettingsService) {
  const encryptedAPIKey = await encrypt(apiKey, encryptionKeyHex);

  const values = {
    userId,
    provider,
    model,
    encryptedApiKey: encryptedAPIKey,
  };

  if (mode === "create-only") {
    const result = await db
      .insert(userAISettings)
      .values(values)
      .onConflictDoNothing({
        target: [userAISettings.userId, userAISettings.provider],
      })
      .returning({ id: userAISettings.id });

    if (!result.length) {
      throw new BadRequestError("AI settings already exist for this provider");
    }

    return {
      message: "AI settings created successfully.",
      data: {
        id: result[0].id,
      },
    };
  }

  if (mode === "update-only") {
    await db
      .insert(userAISettings)
      .values(values)
      .onConflictDoUpdate({
        target: [userAISettings.userId, userAISettings.provider],
        set: {
          model,
          encryptedApiKey: encryptedAPIKey,
          updatedAt: new Date(),
        },
      });

    return { message: "AI settings updated successfully." };
  }

  await db
    .insert(userAISettings)
    .values(values)
    .onConflictDoUpdate({
      target: [userAISettings.userId, userAISettings.provider],
      set: {
        model,
        encryptedApiKey: encryptedAPIKey,
        updatedAt: new Date(),
      },
    });

  return { message: "AI settings saved successfully." };
}

export interface StreamChatService {
  userId: string;
  provider: AIProviderId;
  messages: UIMessage[];
}

export async function streamChatService({
  userId,
  provider,
  messages,
}: StreamChatService) {
  const aiSettings = await getAISettingsService({ userId, provider });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel(provider, apiKey, model),
    messages: convertToModelMessages(messages),
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.CHAT?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.CHAT?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.CHAT?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.CHAT?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.CHAT?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.CHAT?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

export interface StreamCompletionService {
  userId: string;
  provider: AIProviderId;
  prompt: string;
}

export async function streamCompletionService({
  userId,
  provider,
  prompt,
}: StreamCompletionService) {
  const aiSettings = await getAISettingsService({
    userId,
    provider,
  });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel(provider, apiKey, model),
    prompt,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.COMPLETION?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

interface TestAPIKeyService {
  provider: AIProviderId;
  apiKey: string;
  model: ModelName;
}

export async function testAPIKeyService({
  provider,
  apiKey,
  model,
}: TestAPIKeyService) {
  await generateText({
    model: getModel(provider, apiKey, model),
    prompt: 'Just answer "hello world"',
    maxOutputTokens: 16, // Minimum tokens to minimize cost and time
  }).catch((error) => {
    throw new BadRequestError(
      "Invalid API key or provider configuration",
      error,
    );
  });

  return { message: "API key is valid" };
}

interface UpdateAISettingsService {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
}

export async function updateAISettingsService({
  userId,
  provider,
  apiKey,
  model,
}: UpdateAISettingsService) {
  return await saveOrUpdateAISettingsService({
    userId,
    provider,
    apiKey,
    model,
    mode: "update-only",
  });
}

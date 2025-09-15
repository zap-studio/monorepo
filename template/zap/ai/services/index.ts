import "server-only";

import { streamToEventIterator } from "@orpc/server";
import {
  convertToModelMessages,
  generateText,
  streamText,
  type UIMessage,
} from "ai";
import { and, eq } from "drizzle-orm";

import { encryptionKeyHex } from "@/zap/crypto";
import { decrypt } from "@/zap/crypto/decrypt";
import { encrypt } from "@/zap/crypto/encrypt";
import { db } from "@/zap/db/providers/drizzle";
import type { UpsertMode } from "@/zap/db/types";
import { BadRequestError } from "@/zap/errors";
import type { AIServerPluginConfig } from "@/zap/plugins/types/ai.plugin";
import { getApiSettingsForUserAndProviderQuery } from "../db/providers/drizzle/queries";
import { userAISettings } from "../db/providers/drizzle/schema";
import type { AIProviderId, ModelName } from "../types";
import { getModel } from "../utils";

type GetAISettingsService = {
  userId: string;
  provider: AIProviderId;
};

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
    encryptionKeyHex
  );

  return { apiKey: decryptedAPIKey, model };
}

type DeleteAPIKeyService = {
  userId: string;
  provider: AIProviderId;
};

export async function deleteAPIKeyService({
  userId,
  provider,
}: DeleteAPIKeyService) {
  await db
    .delete(userAISettings)
    .where(
      and(
        eq(userAISettings.userId, userId),
        eq(userAISettings.provider, provider)
      )
    )
    .execute();

  return { message: "API key deleted successfully." };
}

type SaveAISettingsService = {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
};

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

type SaveOrUpdateAISettingsService = {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
  mode: UpsertMode;
};

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

export type StreamChatService = {
  userId: string;
  provider: AIProviderId;
  messages: UIMessage[];
  pluginConfigs: { ai: Partial<AIServerPluginConfig> };
};

export async function streamChatService({
  userId,
  provider,
  messages,
  pluginConfigs,
}: StreamChatService) {
  const aiSettings = await getAISettingsService({ userId, provider });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider"
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel({ provider, apiKey, modelName: model }),
    messages: convertToModelMessages(messages),
    system: pluginConfigs.ai.SYSTEM_PROMPT,
    maxOutputTokens: pluginConfigs.ai.CHAT?.MAX_OUTPUT_TOKENS,
    temperature: pluginConfigs.ai.CHAT?.TEMPERATURE,
    presencePenalty: pluginConfigs.ai.CHAT?.PRESENCE_PENALTY,
    frequencyPenalty: pluginConfigs.ai.CHAT?.FREQUENCY_PENALTY,
    stopSequences: pluginConfigs.ai.CHAT?.STOP_SEQUENCES,
    maxRetries: pluginConfigs.ai.CHAT?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

export type StreamCompletionService = {
  userId: string;
  provider: AIProviderId;
  prompt: string;
  pluginConfigs: { ai: Partial<AIServerPluginConfig> };
};

export async function streamCompletionService({
  userId,
  provider,
  prompt,
  pluginConfigs,
}: StreamCompletionService) {
  const aiSettings = await getAISettingsService({
    userId,
    provider,
  });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider"
    );
  }

  const { apiKey, model } = aiSettings;

  const result = streamText({
    model: getModel({ provider, apiKey, modelName: model }),
    prompt,
    system: pluginConfigs.ai.SYSTEM_PROMPT,
    maxOutputTokens: pluginConfigs.ai.COMPLETION?.MAX_OUTPUT_TOKENS,
    temperature: pluginConfigs.ai.COMPLETION?.TEMPERATURE,
    presencePenalty: pluginConfigs.ai.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: pluginConfigs.ai.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: pluginConfigs.ai.COMPLETION?.STOP_SEQUENCES,
    maxRetries: pluginConfigs.ai.COMPLETION?.MAX_RETRIES,
  });

  return streamToEventIterator(result.toUIMessageStream());
}

type TestAPIKeyService = {
  provider: AIProviderId;
  apiKey: string;
  model: ModelName;
};

export async function testAPIKeyService({
  provider,
  apiKey,
  model,
}: TestAPIKeyService) {
  await generateText({
    model: getModel({ provider, apiKey, modelName: model }),
    prompt: 'Just answer "hello world"',
    maxOutputTokens: 16, // Minimum tokens to minimize cost and time
  }).catch((error) => {
    throw new BadRequestError(
      "Invalid API key or provider configuration",
      error
    );
  });

  return { message: "API key is valid" };
}

type UpdateAISettingsService = {
  userId: string;
  provider: AIProviderId;
  model: ModelName;
  apiKey: string;
};

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

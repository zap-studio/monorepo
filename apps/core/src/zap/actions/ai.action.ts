"use server";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "../lib/crypto";
import { AIProviderId } from "../types/ai.types";

export const getAISettings = async (userId: string, provider: AIProviderId) => {
  const [apiKeyRecord] = await db
    .select()
    .from(userAISettings)
    .where(
      and(
        eq(userAISettings.userId, userId),
        eq(userAISettings.provider, provider),
      ),
    )
    .limit(1);

  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  const { iv, encrypted } = apiKeyRecord.encryptedApiKey;
  const apiKey = decrypt(iv, encrypted);
  const model = apiKeyRecord.model;

  return { apiKey, model };
};

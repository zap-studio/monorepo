"use server";

import { db } from "@/db";
import { userApiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "../lib/crypto";
import { AIProviderEnum } from "../schemas/ai.schema";

export const getAPIKey = async (userId: string, provider: AIProviderEnum) => {
  const [apiKeyRecord] = await db
    .select()
    .from(userApiKeys)
    .where(
      and(eq(userApiKeys.userId, userId), eq(userApiKeys.provider, provider)),
    )
    .limit(1);

  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  const { iv, encrypted } = apiKeyRecord.encryptedApiKey;
  const apiKey = decrypt(iv, encrypted);

  return apiKey;
};

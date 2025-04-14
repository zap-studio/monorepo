"use server";

import { db } from "@/db";
import { userApiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "../lib/crypto";

export const getAPIKey = async (userId: string, provider: string) => {
  const [apiKeyRecord] = await db
    .select()
    .from(userApiKeys)
    .where(eq(userApiKeys.userId, userId) && eq(userApiKeys.provider, provider))
    .limit(1);

  if (!apiKeyRecord) {
    throw new Error("API key not found");
  }

  const { iv, encrypted } = JSON.parse(apiKeyRecord.encryptedApiKey);
  const apiKey = decrypt(iv, encrypted);

  return apiKey;
};

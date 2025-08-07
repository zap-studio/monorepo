import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { userAISettings } from "@/db/schema";
import type { AIProviderId } from "@/zap/types/ai.types";

interface DeleteAPIKeyContext {
  session: { user: { id: string } };
}
interface DeleteAPIKeyInput {
  provider: AIProviderId;
}

export async function deleteAPIKeyService({
  context,
  input,
}: {
  context: DeleteAPIKeyContext;
  input: DeleteAPIKeyInput;
}) {
  const userId = context.session.user.id;
  const provider = input.provider;

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

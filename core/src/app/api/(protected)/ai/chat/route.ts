import "server-only";

import { z } from "zod";

import { parseRequestBody } from "@/zap/lib/api/utils";
import { withAuthenticatedApiHandler } from "@/zap/lib/error-handling/handlers";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamChatService } from "@/zap/services/ai/stream-chat.service";

export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.any(),
  provider: AIProviderIdSchema,
});

export const POST = withAuthenticatedApiHandler(async (req: Request) => {
  const { provider, messages } = await parseRequestBody(req, BodySchema);

  const result = await streamChatService({
    input: { provider, messages },
  });

  return result.toUIMessageStreamResponse();
});

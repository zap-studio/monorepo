import "server-only";

import { z } from "zod";

import { getAuthenticatedSession, parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamAIChat } from "@/zap/services/ai.service";

export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.any(),
  provider: AIProviderIdSchema,
});

export const POST = withApiHandler(async (req: Request) => {
  await getAuthenticatedSession(req);
  const { provider, messages } = await parseRequestBody(req, BodySchema);
  const result = await streamAIChat({ provider, messages });
  return result.toUIMessageStreamResponse();
});

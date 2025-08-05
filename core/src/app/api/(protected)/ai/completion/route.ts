import "server-only";

import { z } from "zod";

import { getAuthenticatedSession, parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamAICompletion } from "@/zap/services/ai.service";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export const POST = withApiHandler(async (req: Request) => {
  await getAuthenticatedSession(req);
  const { provider, prompt } = await parseRequestBody(req, BodySchema);
  const result = await streamAICompletion({ provider, prompt });
  return result.toUIMessageStreamResponse();
});

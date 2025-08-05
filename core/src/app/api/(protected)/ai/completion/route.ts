import "server-only";

import { z } from "zod";

import { getAuthenticatedSession, parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamCompletionService } from "@/zap/services/ai/stream-completion.service";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export const POST = withApiHandler(async (req: Request) => {
  await getAuthenticatedSession(req);
  const { provider, prompt } = await parseRequestBody(req, BodySchema);

  const result = await streamCompletionService({
    input: { provider, prompt },
  });

  return result.toUIMessageStreamResponse();
});

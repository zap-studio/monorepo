import "server-only";

import { z } from "zod";

import { withAuthenticatedApiHandler } from "@/zap/lib/api/handlers";
import { parseRequestBody } from "@/zap/lib/api/utils";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamCompletionService } from "@/zap/services/ai/stream-completion.service";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export const POST = withAuthenticatedApiHandler(async (req: Request) => {
  const { provider, prompt } = await parseRequestBody(req, BodySchema);

  const result = await streamCompletionService({
    input: { provider, prompt },
  });

  return result.toUIMessageStreamResponse();
});

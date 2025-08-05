import "server-only";

import { z } from "zod";

import { getAuthenticatedSession, parseRequestBody } from "@/zap/lib/api/utils";
import { withApiHandler } from "@/zap/lib/error-handling/handlers";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { testAIApiKey } from "@/zap/services/ai.service";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

export const POST = withApiHandler(async (req: Request) => {
  await getAuthenticatedSession(req);
  const { provider, apiKey, model } = await parseRequestBody(req, BodySchema);
  const result = await testAIApiKey({ provider, apiKey, model });
  return Response.json(result, { status: 200 });
});

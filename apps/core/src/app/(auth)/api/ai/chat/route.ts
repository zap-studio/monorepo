import { getAPIKey } from "@/zap/actions/ai.action";
import { SYSTEM_PROMPT } from "@/zap/data/ai";
import { getModel } from "@/zap/lib/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderEnumSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.any(),
  provider: AIProviderEnumSchema,
  model: ModelNameSchema,
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);

  const apiKey = await getAPIKey(session.user.id, body.provider);

  const result = streamText({
    model: getModel(body.provider, apiKey, body.model),
    messages: body.messages,
    system: SYSTEM_PROMPT,
  });

  return result.toDataStreamResponse();
}

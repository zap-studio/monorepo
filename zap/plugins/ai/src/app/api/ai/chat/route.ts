import { SYSTEM_PROMPT } from "../../../../data/ai";
import { getModel } from "../../../../lib/ai";
import { AIProviderEnumSchema } from "../../../../schemas/ai.schema";
import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.any(),
  provider: AIProviderEnumSchema,
  apiKey: z.string(),
});

export async function POST(req: Request) {
  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);

  const result = streamText({
    model: getModel(body.provider, body.apiKey),
    messages: body.messages,
    system: SYSTEM_PROMPT,
  });

  return result.toDataStreamResponse();
}

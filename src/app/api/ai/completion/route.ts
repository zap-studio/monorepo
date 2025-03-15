import { SYSTEM_PROMPT } from "@/data/ai";
import { getModel } from "@/lib/ai";
import { AIProvider } from "@/store/ai.store";
import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const bodySchema = z.object({
  prompt: z.string(),
  provider: z.custom<AIProvider>((value) => {
    return value;
  }),
  apiKey: z.string(),
});

export async function POST(req: Request) {
  const unvalidatedBody = await req.json();
  const body = bodySchema.parse(unvalidatedBody);

  const result = streamText({
    model: getModel(body.provider, body.apiKey),
    prompt: body.prompt,
    system: SYSTEM_PROMPT,
  });

  return result.toDataStreamResponse();
}

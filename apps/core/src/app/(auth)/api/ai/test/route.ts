import { SYSTEM_PROMPT } from "@/zap/data/ai";
import { getModel } from "@/zap/lib/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderEnumSchema } from "@/zap/schemas/ai.schema";
import { generateText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderEnumSchema,
  apiKey: z.string(),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);
  const apiKey = body.apiKey;

  try {
    await generateText({
      model: getModel(body.provider, apiKey),
      prompt: "This is just a test, answer with 1 token.",
      system: SYSTEM_PROMPT,
      maxTokens: 1,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  return Response.json({ success: true }, { status: 200 });
}

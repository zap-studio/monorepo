import { getModel } from "@/zap/lib/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";
import { generateText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);
  const { provider, apiKey, model } = body;

  try {
    await generateText({
      model: getModel(provider, apiKey, model),
      prompt: "This is just a test, answer with 1 token.",
      maxTokens: 1,
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  return Response.json({ success: true }, { status: 200 });
}

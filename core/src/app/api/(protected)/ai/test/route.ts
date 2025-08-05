import "server-only";

import { generateText } from "ai";
import { z } from "zod";

import { getModel } from "@/zap/lib/ai/get-model";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let unvalidatedBody;
    try {
      unvalidatedBody = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 401 });
    }

    const body = BodySchema.parse(unvalidatedBody);
    const { provider, apiKey, model } = body;

    try {
      await generateText({
        model: getModel(provider, apiKey, model),
        prompt: "This is just a test, answer with 1 token.",
        maxOutputTokens: 16,
      });
    } catch {
      return Response.json({ error: "Invalid API key" }, { status: 401 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return Response.json({ error: message }, { status: 401 });
  }
}

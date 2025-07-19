"use server";
import "server-only";

import { Effect } from "effect";

import { $fetch } from "@/lib/fetch";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface TestAPIKeyContext {
  headers: Headers;
}
interface TestAPIKeyInput {
  provider: AIProviderId;
  apiKey: string;
  model: ModelName;
}

export async function testAPIKeyAction({
  input,
  context,
}: {
  input: TestAPIKeyInput;
  context: TestAPIKeyContext;
}) {
  const effect = Effect.gen(function* (_) {
    const provider = input.provider;
    const apiKey = input.apiKey;
    const model = input.model;
    let headers = new Headers(context.headers);

    const filteredHeaders = new Headers();
    for (const [key, value] of headers.entries()) {
      if (key !== "content-length" && key !== "content-type") {
        filteredHeaders.append(key, value);
      }
    }
    headers = filteredHeaders;

    yield* _(
      Effect.tryPromise({
        try: () =>
          $fetch("/api/ai/test", {
            method: "POST",
            body: { provider, apiKey, model },
            headers,
          }),
        catch: () => new Error("Failed to test API key"),
      }),
    );

    return { success: true };
  });

  return await Effect.runPromise(effect);
}

import "server-only";

import { $fetch } from "@/lib/fetch";
import { InternalServerError } from "@/zap/lib/error-handling/errors";
import type { AIProviderId, ModelName } from "@/zap/types/ai.types";

interface TestAPIKeyContext {
  headers: Headers;
}
interface TestAPIKeyInput {
  provider: AIProviderId;
  apiKey: string;
  model: ModelName;
}

export async function testAPIKeyService({
  input,
  context,
}: {
  input: TestAPIKeyInput;
  context: TestAPIKeyContext;
}) {
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

  await $fetch("/api/ai/test", {
    method: "POST",
    body: { provider, apiKey, model },
    headers,
  }).catch((error) => {
    throw new InternalServerError(
      `Failed to test API key for provider ${provider}: ${error.message}`,
    );
  });
}
